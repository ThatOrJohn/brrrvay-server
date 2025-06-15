/*
  # Add RLS policies for admin operations

  1. Changes
    - Add policies for internal users to manage organizations
    - Add policies for internal users to manage concepts
    - Add policies for internal users to manage stores
    - Add policies for internal users to manage users and access
    
  2. Security
    - Only internal users can perform these operations
    - Maintains existing read-only policies
    - Ensures proper access control at all levels
*/

-- Organizations table policies
CREATE POLICY "Internal users can insert organizations"
ON organizations
FOR INSERT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can update organizations"
ON organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can delete organizations"
ON organizations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

-- Concepts table policies
CREATE POLICY "Internal users can insert concepts"
ON concepts
FOR INSERT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can update concepts"
ON concepts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can delete concepts"
ON concepts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

-- Stores table policies
CREATE POLICY "Internal users can insert stores"
ON stores
FOR INSERT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can update stores"
ON stores
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can delete stores"
ON stores
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

-- Users table policies
CREATE POLICY "Internal users can insert users"
ON users
FOR INSERT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can update users"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can delete users"
ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

-- User access table policies
CREATE POLICY "Internal users can manage user access"
ON user_access
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);