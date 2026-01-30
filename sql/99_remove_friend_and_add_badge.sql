-- Migration script to remove 'affiliation' concept and add 'cohort' column for 'Admin hosted' badge

BEGIN;

-- 1. Drop affiliation column if it exists (since user doesn't want it)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS affiliation CASCADE;

-- 2. Add 'cohort' column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cohort text;

-- 3. Backfill cohort information from verified_members
UPDATE public.profiles p
SET cohort = vm.cohort
FROM public.verified_members vm
WHERE p.email = vm.email OR LOWER(p.full_name) = LOWER(vm.full_name);

-- 4. Update the handle_new_user trigger function to include cohort syncing and exclude affiliation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    matched_cohort text;
BEGIN
  -- Look up cohort from verified_members
  SELECT cohort INTO matched_cohort
  FROM public.verified_members
  WHERE email = NEW.email OR LOWER(full_name) = LOWER(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, cohort)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    matched_cohort
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
