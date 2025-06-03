/*
  # Fix internal_users policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create a single, clear policy for viewing internal users
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own internal user data" ON internal_users;
DROP POLICY IF EXISTS "Internal users can view all internal user data" ON internal_users;
DROP POLICY IF EXISTS "Internal users can view internal user data" ON internal_users;

-- Create a single policy that handles both cases
CREATE POLICY "internal_users_select_policy"
ON internal_users
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own record OR if they are an internal user
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 
    FROM internal_users viewer 
    WHERE viewer.id = auth.uid()
  )
);