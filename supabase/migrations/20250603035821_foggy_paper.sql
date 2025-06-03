/*
  # Create internal admin user

  1. Changes
    - Creates a new internal admin user with specified credentials
    - Sets up proper role and permissions

  2. Security
    - Password is properly hashed
    - Role is set to 'admin'
*/

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First create the user in auth.users with a specific UUID
DO $$
DECLARE
    new_user_id UUID := uuid_generate_v4();
BEGIN
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        role,
        aud,
        created_at
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'john.walley@gmail.com',
        crypt('ThatOrJohn!2', gen_salt('bf')),
        NOW(),
        jsonb_build_object('name', 'John Walley'),
        'authenticated',
        'authenticated',
        NOW()
    );

    -- Then create the internal user record
    INSERT INTO internal_users (
        id,
        email,
        name,
        role,
        created_at
    ) VALUES (
        new_user_id,
        'john.walley@gmail.com',
        'John Walley',
        'admin',
        NOW()
    );
END $$;