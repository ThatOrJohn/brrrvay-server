/*
  # Fix internal users RLS policy

  1. Changes
    - Drop existing problematic policy that causes infinite recursion
    - Add new simplified policy for internal users to view their own data
    
  2. Security
    - Enable RLS on internal_users table (in case it was disabled)
    - Add policy for authenticated users to read their own data
    - Add policy for internal users to read all internal user data
*/

-- First enable RLS (in case it was disabled)
ALTER TABLE internal_users ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Internal users can view internal user data" ON internal_users;

-- Create new simplified policy
CREATE POLICY "Users can view own internal user data"
ON internal_users
FOR SELECT
TO authenticated
USING (
  -- Simple direct comparison with the authenticated user's ID
  id = auth.uid()
);

-- Create policy for internal users to view all internal user data
CREATE POLICY "Internal users can view all internal user data"
ON internal_users
FOR SELECT
TO authenticated
USING (
  -- Check if the authenticated user exists in internal_users
  EXISTS (
    SELECT 1 
    FROM internal_users
    WHERE id = auth.uid()
  )
);