# Testing Cohort Verification After Fix

## What Was Fixed

1. **API Route:** Added missing `await` before `createClient()`
2. **Error Handling:** Added detailed console logging
3. **Frontend:** Improved error handling and logging

---

## How to Test

### Step 1: Deploy the Fix

```bash
git add .
git commit -m "Fix verification API - add await to createClient"
git push
```

Wait for Vercel deployment to complete.

### Step 2: Ensure Database Setup

Run in Supabase SQL Editor:

```sql
-- 1. Check if function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'verify_host';
-- Should return: verify_host

-- 2. Check if table has data
SELECT COUNT(*) FROM verified_members;
-- Should return: 1000+ rows

-- 3. Test function directly
SELECT * FROM verify_host('any-valid-host-id');
```

If function doesn't exist → Run `sql/06_verified_members.sql`
If no data → Run `sql/import_verified_members.sql`

### Step 3: Test in Browser

1. Open `/admin/review/[any-event-id]`
2. Open browser console (F12)
3. Look for these logs:
   ```
   [VERIFY] Fetching verification for host: uuid-here
   [VERIFY] Response status: 200
   [VERIFY] Success: {is_verified: true, cohort: "Cohort 3", matched_by: "email"}
   ```

### Step 4: Check Vercel Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Logs"
4. Look for:
   ```
   [VERIFY-HOST] Checking host: uuid-here
   [VERIFY-HOST] RPC Response: [{ is_verified: true, ... }]
   [VERIFY-HOST] Returning: { is_verified: true, ... }
   ```

---

## Expected Behavior

### Success Case:
```
Browser Console:
[VERIFY] Fetching verification for host: abc-123-def
[VERIFY] Response status: 200
[VERIFY] Success: {
  is_verified: true,
  cohort: "Cohort 3",
  matched_by: "email"
}

UI: Green badge showing "Cohort 3 - Verified 100x Member"
```

### Not Found Case:
```
Browser Console:
[VERIFY] Fetching verification for host: xyz-456-ghi
[VERIFY] Response status: 200
[VERIFY] Success: {
  is_verified: false,
  cohort: null,
  matched_by: null
}

UI: Yellow badge showing "Not Verified - Manual verification required"
```

### Error Case:
```
Browser Console:
[VERIFY] Fetching verification for host: invalid-id
[VERIFY] Response status: 500
[VERIFY] API failed with status: 500
[VERIFY] Error response: {"error":"Verification failed","details":"..."}

UI: Yellow badge (fallback to not verified)
```

---

## Common Issues After Fix

### Issue: Still getting "Not Verified" for all users

**Possible causes:**
1. Database function doesn't exist
2. No data in verified_members table
3. Email/name doesn't match exactly

**Debug:**
```sql
-- Check specific user
SELECT
  p.id,
  p.email,
  p.full_name,
  vm.email as verified_email,
  vm.cohort,
  verify_host.is_verified
FROM profiles p
LEFT JOIN verified_members vm ON LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
CROSS JOIN LATERAL verify_host(p.id) AS verify_host
WHERE p.email = 'actual-user@email.com';
```

### Issue: 401 Unauthorized

**Fix:** You're not logged in as admin
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your-admin@email.com';
```

### Issue: 500 Error

**Check Vercel logs for:**
- `function verify_host does not exist` → Run SQL schema
- `relation "verified_members" does not exist` → Create table
- Other RPC errors → Share logs for debugging

---

## Manual Test Case

Create a guaranteed match:

```sql
-- 1. Get your profile details
SELECT id, email, full_name FROM profiles WHERE email = 'your@email.com';

-- 2. Add yourself to verified_members
INSERT INTO verified_members (full_name, email, cohort)
VALUES ('Your Full Name', 'your@email.com', 'Cohort 1');

-- 3. Submit a test event (or use existing event)
-- 4. Go to admin review page
-- Should see: Green badge "Cohort 1 - Verified 100x Member"
```

---

## Logs to Share if Still Broken

If still not working after following above steps, share:

1. **Browser Console Output:**
   - All `[VERIFY]` logs
   - Any error messages

2. **Vercel Logs:**
   - All `[VERIFY-HOST]` logs
   - Error stack traces

3. **Database Query Results:**
   ```sql
   -- Run this and share output
   SELECT
     e.id as event_id,
     e.host_id,
     p.email,
     p.full_name,
     vm.email as verified_email,
     vm.cohort,
     (SELECT is_verified FROM verify_host(e.host_id)) as verification_result
   FROM events e
   JOIN profiles p ON p.id = e.host_id
   LEFT JOIN verified_members vm ON LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email))
   WHERE e.status = 'submitted'
   LIMIT 3;
   ```

This will help pinpoint exact issue.
