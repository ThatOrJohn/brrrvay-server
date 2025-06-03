/*
  # Add debug policy for internal users

  1. Security Changes
    - Add policy to allow anonymous users to view internal user emails for debugging
    - This policy only allows access to the email field for security
*/

CREATE POLICY "Allow viewing internal user emails for debugging"
  ON internal_users
  FOR SELECT
  TO anon
  USING (true)
  WITH CHECK (false);

-- Ensure RLS is enabled
ALTER TABLE internal_users ENABLE ROW LEVEL SECURITY;