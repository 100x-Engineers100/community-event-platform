-- =============================================
-- TRIGGER: Handle New User Signup
-- Description: Automatically creates a profile in public.profiles when a user signs up via auth.users
-- Execute this in Supabase SQL Editor to FIX THE LOGIN LOOP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, affiliation)
  VALUES (
    NEW.id,
    NEW.email,
    -- Try to get name from metadata, fallback to email part if missing
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    'Friend of 100x' -- Default affiliation, user can update this later
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
