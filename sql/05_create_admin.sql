-- Create Admin User
-- Run this in Supabase SQL Editor to grant admin privileges

-- Replace 'your-email@example.com' with the actual admin email
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Verify admin was created
SELECT id, email, full_name, is_admin
FROM profiles
WHERE is_admin = true;

-- Examples:
-- UPDATE profiles SET is_admin = true WHERE email = 'admin@100xengineers.com';
-- UPDATE profiles SET is_admin = true WHERE email = 'vishalmathpal1@gmail.com';
