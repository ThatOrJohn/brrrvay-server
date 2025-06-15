
-- Add is_active column to users table
ALTER TABLE public.users 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Create an index for better performance when filtering by is_active
CREATE INDEX idx_users_is_active ON public.users(is_active);
