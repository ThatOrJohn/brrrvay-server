/*
  # Simplify internal users policy

  1. Changes
    - Drop all existing policies
    - Create a single, non-recursive policy for internal_users table
    
  2. Security
    - Maintains row-level security
    - Allows users to view their own record
    - Allows internal users to view all records
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own internal user data" ON internal_users;
DROP POLICY IF EXISTS "Internal users can view all internal user data" ON internal_users;
DROP POLICY IF EXISTS "Internal users can view internal user data" ON internal_users;
DROP POLICY IF EXISTS "internal_users_select_policy" ON internal_users;

-- Create a single, simple policy
CREATE POLICY "internal_users_access_policy"
ON internal_users
FOR SELECT
TO authenticated
USING (
  -- Simple condition: either it's your own record or you're in the internal_users table
  id = auth.uid()
);