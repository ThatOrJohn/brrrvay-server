/*
  # Add Agent Management Tables

  1. New Tables
    - `agents`: Stores agent information and configuration
    - `agent_registration_tokens`: Temporary tokens for agent registration
    - `store_agents`: Many-to-many relationship between stores and agents

  2. Security
    - Enable RLS on all new tables
    - Add policies for internal users and store users to manage agents
*/

-- AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  agent_key TEXT UNIQUE NOT NULL, -- Unique identifier for the agent
  status TEXT CHECK (status IN ('online', 'offline', 'error', 'maintenance')) DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ,
  version TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- AGENT REGISTRATION TOKENS TABLE
CREATE TABLE IF NOT EXISTS agent_registration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_by UUID REFERENCES internal_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_agent_id UUID REFERENCES agents(id),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE agent_registration_tokens ENABLE ROW LEVEL SECURITY;

-- STORE AGENTS MAPPING TABLE
CREATE TABLE IF NOT EXISTS store_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES internal_users(id),
  config JSONB DEFAULT '{}', -- Store-specific agent configuration
  is_active BOOLEAN DEFAULT true,
  UNIQUE(store_id, agent_id)
);

ALTER TABLE store_agents ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_agents_agent_key ON agents(agent_key);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agent_registration_tokens_token ON agent_registration_tokens(token);
CREATE INDEX idx_agent_registration_tokens_store_id ON agent_registration_tokens(store_id);
CREATE INDEX idx_agent_registration_tokens_expires_at ON agent_registration_tokens(expires_at);
CREATE INDEX idx_store_agents_store_id ON store_agents(store_id);
CREATE INDEX idx_store_agents_agent_id ON store_agents(agent_id);

-- Add updated_at trigger for agents table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES

-- Agents table policies
CREATE POLICY "Internal users can view all agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can manage agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

-- Store users can view agents assigned to their stores
CREATE POLICY "Store users can view their store agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_access ua
    JOIN store_agents sa ON ua.store_id = sa.store_id
    WHERE ua.user_id = auth.uid() AND sa.agent_id = agents.id
  ));

-- Agent registration tokens policies
CREATE POLICY "Internal users can manage registration tokens"
  ON agent_registration_tokens
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

-- Store users can view tokens for their stores
CREATE POLICY "Store users can view their store tokens"
  ON agent_registration_tokens
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_access ua
    WHERE ua.user_id = auth.uid() AND ua.store_id = agent_registration_tokens.store_id
  ));

-- Store agents mapping policies
CREATE POLICY "Internal users can manage store agent mappings"
  ON store_agents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

-- Store users can view their store agent mappings
CREATE POLICY "Store users can view their store agent mappings"
  ON store_agents
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_access ua
    WHERE ua.user_id = auth.uid() AND ua.store_id = store_agents.store_id
  ));