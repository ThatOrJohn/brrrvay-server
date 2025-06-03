/*
  # Initial Schema Setup

  1. New Tables
    - organizations: Top-level companies/franchisees
    - concepts: Brand groupings within an org
    - stores: Physical locations under concepts
    - users: Customer-facing users
    - user_access: User access scopes
    - trials: Trial period tracking
    - internal_users: Support and admin users
    - internal_user_scopes: Internal user access control
    - impersonation_events: Audit log for user impersonation

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
*/

-- ORGANIZATIONS
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ,
  is_trial_extended BOOLEAN DEFAULT false
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- CONCEPTS
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;

-- STORES
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID REFERENCES concepts(id),
  name TEXT NOT NULL,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (
    role IN ('company_admin', 'org_user', 'store_user')
  ) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  password_hash TEXT
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- USER ACCESS SCOPES
CREATE TABLE user_access (
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  concept_id UUID REFERENCES concepts(id),
  store_id UUID REFERENCES stores(id),
  PRIMARY KEY (user_id, store_id)
);

ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- TRIALS
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  extended_until TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'expired', 'converted')) DEFAULT 'active',
  notes TEXT
);

ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- INTERNAL USERS
CREATE TABLE internal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('support', 'admin', 'developer')) DEFAULT 'support',
  created_at TIMESTAMPTZ DEFAULT now(),
  password_hash TEXT
);

ALTER TABLE internal_users ENABLE ROW LEVEL SECURITY;

-- INTERNAL USER SCOPES
CREATE TABLE internal_user_scopes (
  internal_user_id UUID REFERENCES internal_users(id),
  organization_id UUID REFERENCES organizations(id),
  can_impersonate BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  PRIMARY KEY (internal_user_id, organization_id)
);

ALTER TABLE internal_user_scopes ENABLE ROW LEVEL SECURITY;

-- IMPERSONATION EVENTS
CREATE TABLE impersonation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_user_id UUID REFERENCES internal_users(id),
  impersonated_user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE impersonation_events ENABLE ROW LEVEL SECURITY;

-- Create internal user
INSERT INTO internal_users (email, name, role, password_hash)
VALUES (
  'john.walley@gmail.com',
  'John Walley',
  'admin',
  crypt('ThatOrJohn!2', gen_salt('bf'))
);

-- Basic RLS Policies
CREATE POLICY "Internal users can view all organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can view all concepts"
  ON concepts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can view all stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can view all trials"
  ON trials
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can view internal user data"
  ON internal_users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));