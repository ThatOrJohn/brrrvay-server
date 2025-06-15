/*
  # Create internal user

  1. Changes
    - Insert a new internal user with provided credentials
    - Set role as 'admin'

  2. Security
    - Password is hashed using Supabase Auth
    - User will have access to internal user data through RLS policies
*/

-- First create the user in auth.users
INSERT INTO auth.users (
  email,
  raw_user_meta_data,
  role,
  encrypted_password
) VALUES (
  'john.walley@gmail.com',
  '{"name": "John Walley"}',
  'authenticated',
  crypt('ThatOrJohn!2', gen_salt('bf'))
);

-- Then create the internal user record
INSERT INTO internal_users (
  id,
  email,
  name,
  role
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'john.walley@gmail.com'),
  'john.walley@gmail.com',
  'John Walley',
  'admin'
);