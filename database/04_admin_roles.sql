-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- The main admin
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'veronenji2023@gmail.com';
