
export type Agent = {
  id: string;
  name: string;
  description?: string;
  agent_key: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  last_seen_at?: string;
  version?: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type AgentRegistrationToken = {
  id: string;
  token: string;
  store_id: string;
  created_by?: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
  used_by_agent_id?: string;
  is_active: boolean;
};

export type StoreAgent = {
  id: string;
  store_id: string;
  agent_id: string;
  assigned_at: string;
  assigned_by?: string;
  config: Record<string, any>;
  is_active: boolean;
  agent?: Agent;
  store?: {
    id: string;
    name: string;
  };
};

export type GenerateTokenRequest = {
  store_id: string;
  expires_in_minutes?: number;
};

export type RegisterAgentRequest = {
  token: string;
  agent_key: string;
  name?: string;
  description?: string;
  version?: string;
  config?: Record<string, any>;
};

export type HeartbeatRequest = {
  agent_key: string;
  status?: 'online' | 'offline' | 'error' | 'maintenance';
  config?: Record<string, any>;
  version?: string;
};
