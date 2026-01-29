-- DEBUG: Cohort Verification Troubleshooting
-- Run these queries in Supabase SQL Editor to find the issue

-- Step 1: Check if verified_members table has data
SELECT cohort, COUNT(*) as count
FROM verified_members
GROUP BY cohort
ORDER BY cohort;
-- Expected: Should show Cohort 1, Cohort 2, etc. with counts

-- Step 2: Check a sample of verified members
SELECT full_name, email, cohort
FROM verified_members
LIMIT 10;
-- Expected: Should show actual member data

-- Step 3: Check profiles table (hosts)
SELECT id, full_name, email, affiliation
FROM profiles
LIMIT 10;
-- Expected: Should show user profiles

-- Step 4: Test email matching (case-insensitive check)
SELECT
  p.full_name as profile_name,
  p.email as profile_email,
  vm.full_name as verified_name,
  vm.email as verified_email,
  vm.cohort
FROM profiles p
LEFT JOIN verified_members vm ON LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
WHERE p.is_admin = false
LIMIT 10;
-- Expected: Should show matches if emails are identical

-- Step 5: Test name matching (case-insensitive check)
SELECT
  p.full_name as profile_name,
  p.email as profile_email,
  vm.full_name as verified_name,
  vm.email as verified_email,
  vm.cohort
FROM profiles p
LEFT JOIN verified_members vm ON LOWER(TRIM(vm.full_name)) = LOWER(TRIM(p.full_name))
WHERE p.is_admin = false
LIMIT 10;
-- Expected: Should show matches if names are identical

-- Step 6: Test the verify_host function with a real host_id
-- Replace 'YOUR-HOST-ID-HERE' with actual host_id from events table
SELECT * FROM verify_host('YOUR-HOST-ID-HERE');
-- Expected: Should return is_verified=true if match found

-- Step 7: Find a host_id to test with
SELECT e.id as event_id, e.host_id, p.full_name, p.email
FROM events e
JOIN profiles p ON p.id = e.host_id
WHERE e.status = 'submitted'
LIMIT 5;
-- Copy a host_id from here and use in Step 6

-- Step 8: Check for email format issues (spaces, case)
SELECT
  email,
  LENGTH(email) as email_length,
  LENGTH(TRIM(email)) as trimmed_length,
  email = TRIM(email) as is_trimmed
FROM verified_members
WHERE email != TRIM(email)
LIMIT 10;
-- Expected: Should be empty (no untrimmed emails)

-- Step 9: Check for duplicate emails in verified_members
SELECT email, COUNT(*) as count
FROM verified_members
GROUP BY email
HAVING COUNT(*) > 1;
-- Expected: Should be empty (no duplicates)

-- Step 10: Full diagnostic - check if ANY profile matches
SELECT
  p.id as host_id,
  p.full_name,
  p.email,
  EXISTS(
    SELECT 1 FROM verified_members vm
    WHERE LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
  ) as email_match,
  EXISTS(
    SELECT 1 FROM verified_members vm
    WHERE LOWER(TRIM(vm.full_name)) = LOWER(TRIM(p.full_name))
  ) as name_match,
  (SELECT vm.cohort FROM verified_members vm
   WHERE LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
   OR LOWER(TRIM(vm.full_name)) = LOWER(TRIM(p.full_name))
   LIMIT 1) as matched_cohort
FROM profiles p
WHERE p.is_admin = false
ORDER BY p.created_at DESC
LIMIT 10;
