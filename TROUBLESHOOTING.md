# Troubleshooting: "Not Verified" Issue

## Quick Fix Steps

### Step 1: Update verify_host Function
Run this in Supabase SQL Editor:
```sql
-- Copy content from: sql/06_verified_members_v2.sql
```
This adds TRIM() to handle whitespace in emails/names.

### Step 2: Run Diagnostic Queries
Open Supabase → SQL Editor and run queries from:
```
sql/debug_verification.sql
```

Run them **in order** and check results.

---

## Common Issues & Fixes

### Issue 1: No data in verified_members table

**Check:**
```sql
SELECT COUNT(*) FROM verified_members;
```

**Fix:**
- If count = 0, you haven't imported data yet
- Run: `sql/import_verified_members.sql`

---

### Issue 2: Email/Name mismatch

**Check:**
```sql
-- Find a specific user
SELECT p.email, p.full_name, vm.email, vm.full_name, vm.cohort
FROM profiles p
LEFT JOIN verified_members vm ON LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
WHERE p.email = 'user@example.com';
```

**Possible causes:**
- User signed up with different email than cohort email
- Name in profile doesn't match name in CSV
- Extra spaces in email/name

**Fix:**
- Manually update profile OR
- Add alternate email to verified_members

---

### Issue 3: Function not returning data

**Test function directly:**
```sql
-- Get a host_id first
SELECT host_id, profiles.email
FROM events
JOIN profiles ON profiles.id = events.host_id
WHERE status = 'submitted'
LIMIT 1;

-- Test function with that host_id
SELECT * FROM verify_host('paste-host-id-here');
```

**Expected output:**
```
is_verified | matched_cohort | matched_by
true        | Cohort 3       | email
```

**If returns false:**
- Profile email/name doesn't exist in verified_members
- Check Step 2 diagnostic queries

---

### Issue 4: API endpoint not working

**Test API manually:**
1. Get host_id from events table
2. Call API:
```bash
curl https://your-domain.vercel.app/api/admin/verify-host/[host_id]
```

**Expected response:**
```json
{
  "is_verified": true,
  "cohort": "Cohort 3",
  "matched_by": "email"
}
```

**If 401/403 error:**
- You're not logged in as admin
- Check `is_admin` flag in profiles table

**If 500 error:**
- Check Vercel logs for details
- Function might not exist in database

---

## Step-by-Step Debugging

### 1. Verify Data Import

```sql
-- Should return 1000+ rows
SELECT COUNT(*) FROM verified_members;

-- Should show cohorts
SELECT cohort, COUNT(*) FROM verified_members GROUP BY cohort;
```

### 2. Check Profile vs Verified Members

```sql
-- Replace with actual user email
SELECT
  p.email as profile_email,
  p.full_name as profile_name,
  vm.email as verified_email,
  vm.full_name as verified_name,
  vm.cohort
FROM profiles p
LEFT JOIN verified_members vm ON LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
WHERE p.email = 'user@example.com';
```

If `verified_email` is NULL → No match found

### 3. Test Function

```sql
-- Get host_id from an event
SELECT e.host_id, p.email, p.full_name
FROM events e
JOIN profiles p ON p.id = e.host_id
LIMIT 1;

-- Test verify_host function
SELECT * FROM verify_host('paste-host-id-from-above');
```

### 4. Check API Response

Open browser console on admin review page:
```javascript
// Check network tab for API calls
// Look for: /api/admin/verify-host/[id]
// Check response body
```

---

## Quick Test Case

Run this to create a test scenario:

```sql
-- 1. Find a profile
SELECT id, email, full_name FROM profiles WHERE is_admin = false LIMIT 1;

-- 2. Manually add them to verified_members
INSERT INTO verified_members (full_name, email, cohort)
VALUES ('Test User', 'test@example.com', 'Cohort 1');

-- 3. Test function
SELECT * FROM verify_host('profile-id-from-step-1');
-- Should return is_verified = true
```

---

## Files to Check

1. **Database:**
   - `sql/06_verified_members_v2.sql` - Updated function
   - `sql/import_verified_members.sql` - Data import
   - `sql/debug_verification.sql` - Diagnostic queries

2. **API:**
   - `app/api/admin/verify-host/[id]/route.ts` - Endpoint

3. **Frontend:**
   - `app/admin/review/[id]/page.tsx` - Display logic

---

## Expected Behavior

### When Working Correctly:

1. Admin opens `/admin/review/[event-id]`
2. Page fetches event + host details
3. Calls `/api/admin/verify-host/[host_id]`
4. API calls `verify_host()` SQL function
5. Function checks verified_members table
6. Returns match if email OR name matches
7. Frontend displays green badge with cohort

### Debug Flow:

```
Admin Review Page
    ↓ fetch(`/api/admin/events?status=submitted`)
Event Data (includes host_id)
    ↓ fetch(`/api/admin/verify-host/${host_id}`)
API Endpoint
    ↓ supabase.rpc('verify_host', { host_id })
SQL Function
    ↓ JOIN profiles with verified_members
Result: { is_verified, cohort, matched_by }
    ↓ return to frontend
Display Badge
```

---

## Still Not Working?

Run this full diagnostic:

```sql
-- Get event details
SELECT
  e.id as event_id,
  e.host_id,
  p.email,
  p.full_name,
  p.affiliation,
  vm.email as verified_email,
  vm.full_name as verified_name,
  vm.cohort,
  verify_host.is_verified,
  verify_host.matched_cohort,
  verify_host.matched_by
FROM events e
JOIN profiles p ON p.id = e.host_id
LEFT JOIN verified_members vm ON (
  LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email)) OR
  LOWER(TRIM(vm.full_name)) = LOWER(TRIM(p.full_name))
)
CROSS JOIN LATERAL verify_host(e.host_id) AS verify_host
WHERE e.status = 'submitted'
LIMIT 5;
```

This shows complete picture for each event.

Share output and I'll help debug further.
