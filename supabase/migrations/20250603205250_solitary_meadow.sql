/*
  # Add external users support
  
  1. New Tables
    - `external_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. New Table
    - `external_user_stores`
      - Links external users to stores they can access
      - Supports many-to-many relationship

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated internal users
*/

-- Create external_users table
CREATE TABLE IF NOT EXISTS external_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create external_user_stores table
CREATE TABLE IF NOT EXISTS external_user_stores (
  external_user_id uuid REFERENCES external_users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (external_user_id, store_id)
);

-- Enable RLS
ALTER TABLE external_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_user_stores ENABLE ROW LEVEL SECURITY;

-- Policies for external_users
CREATE POLICY "Internal users can manage external users"
  ON external_users
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE internal_users.id = auth.uid()
  ));

-- Policies for external_user_stores
CREATE POLICY "Internal users can manage external user store access"
  ON external_user_stores
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE internal_users.id = auth.uid()
  ));