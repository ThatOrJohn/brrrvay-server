
-- Create an enum for user roles
CREATE TYPE public.user_role_type AS ENUM ('store_user', 'store_admin');

-- Create a user_roles table to support multiple roles per user
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role user_role_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on the new table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Internal users can view all user roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

CREATE POLICY "Internal users can manage user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_users WHERE id = auth.uid()
  ));

-- Migrate existing users to the new role system
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'store_user'::user_role_type
FROM public.users
WHERE role = 'store_user';

-- Remove the role column from users table (we'll keep it for now for backward compatibility)
-- ALTER TABLE public.users DROP COLUMN role;
