
export type Organization = {
  id: string;
  name: string;
  created_at: string;
  trial_ends_at: string | null;
  is_active: boolean;
};

export type Concept = {
  id: string;
  name: string;
  organization_id: string;
  is_active: boolean;
};

export type Store = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
  is_active: boolean;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string | null;
  created_at: string;
  is_active: boolean;
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

export type EditState = {
  type: 'organization' | 'concept' | 'store' | 'user' | null;
  id: string | null;
  data: {
    name?: string;
    email?: string;
    external_id?: string;
    password?: string;
  };
};

export type NewUser = {
  email: string;
  name: string;
  password: string;
  selectedStores: string[];
};
