/*
  # Add RLS policies for internal user management
  
  1. Changes
    - Add policies for organizations table
    - Add policies for concepts table
    - Add policies for stores table
    - Add policies for users table
    - Add policies for user_access table
  
  2. Security
    - All policies check for internal user authentication
    - Proper WITH CHECK clauses for INSERT policies
    - USING clauses for other operations
*/

-- Organizations table policies
CREATE POLICY "Internal users can insert organizations"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (
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
WITH CHECK (
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
WITH CHECK (
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
WITH CHECK (
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
CREATE POLICY "Internal users can insert user access"
ON user_access
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can update user access"
ON user_access
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can delete user access"
ON user_access
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);