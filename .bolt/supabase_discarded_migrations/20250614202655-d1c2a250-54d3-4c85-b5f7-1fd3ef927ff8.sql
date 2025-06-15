
-- Check if there are proper RLS policies for user_access table
-- The current policies require the user to be an internal user
-- But we need to allow internal users to insert user access records

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Internal users can insert user access" ON user_access;
DROP POLICY IF EXISTS "Internal users can update user access" ON user_access;
DROP POLICY IF EXISTS "Internal users can delete user access" ON user_access;
DROP POLICY IF EXISTS "Internal users can manage user access" ON user_access;

-- Create specific policies for user_access table
CREATE POLICY "Internal users can insert user access"
ON user_access
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Internal users can select user access"
ON user_access
FOR SELECT
TO authenticated
USING (
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
