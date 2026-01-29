# Setup Instructions for New Features

## Feature 1: Cohort Verification System
## Feature 2: Share Button

---

## FEATURE 1: COHORT VERIFICATION

### Step 1: Run Database Schema in Supabase

1. Open Supabase Dashboard → SQL Editor
2. Run the SQL file: `sql/06_verified_members.sql`
3. This creates:
   - `verified_members` table
   - Indexes for fast lookup
   - `verify_host()` function

### Step 2: Import CSV Data into Supabase

**Option A: Using Script (Recommended)**

1. Generate SQL INSERT statements:
```bash
node scripts/import-cohort-data.js > import.sql
```

> [!TIP]
> If you get a **"stdout is not a tty"** error on Windows (Git Bash), try:
> `node.exe scripts/import-cohort-data.js > import.sql`
> or
> `command node scripts/import-cohort-data.js > import.sql`

2. Copy output from `import.sql`
3. Open Supabase → SQL Editor
4. Paste and run the INSERT statements

**Option B: Manual CSV Import**

1. Open Supabase Dashboard
2. Go to Table Editor → verified_members
3. Click "Insert" → "Import data from CSV"
4. Upload: `C1-C6 - Sheet1 (1).csv`
5. Map columns:
   - Name → full_name
   - Email → email
   - Cohort → cohort

### Step 3: Verify Import

Run this query in Supabase SQL Editor:
```sql
SELECT cohort, COUNT(*) as count
FROM verified_members
GROUP BY cohort
ORDER BY cohort;
```

Expected output:
```
Cohort 1: ~50 members
Cohort 2: ~XX members
... (continues for C1-C6)
```

### Step 4: Test API Endpoint

1. Get a host_id from profiles table
2. Test endpoint:
```bash
curl https://your-domain.com/api/admin/verify-host/[host_id]
```

Expected response:
```json
{
  "is_verified": true,
  "cohort": "Cohort 3",
  "matched_by": "email"
}
```

### Step 5: Admin Review Page

Navigate to: `/admin/review/[event_id]`

You should see in the Host Information card:
- Green badge: "Cohort X - Verified 100x Member"
- Yellow badge: "Not Verified - Manual verification required"

---

## FEATURE 2: SHARE BUTTON

### How It Works

1. User visits event page: `/events/[id]`
2. Clicks share button (top right)
3. Event URL copied to clipboard
4. Toast notification: "Link copied!"
5. Share button shows checkmark animation

### Test

1. Open any event: `/events/[id]`
2. Click share icon (top right)
3. Paste clipboard → Should be: `https://your-domain.com/events/[id]`

---

## IMPORTANT NOTES

### Cohort Verification
- Matches by **email** OR **full name** (case-insensitive)
- If both match different cohorts, **email takes priority**
- Admin sees verification status IMMEDIATELY on review page
- Non-verified hosts can still submit events (admin decides)

### Share Button
- Works on all modern browsers
- Fallback for older browsers included
- Toast auto-dismisses after 2 seconds
- Button shows checkmark animation on success

---

## TROUBLESHOOTING

### Cohort Verification Not Working
1. Check if `verified_members` table has data:
```sql
SELECT COUNT(*) FROM verified_members;
```

2. Check if function exists:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'verify_host';
```

3. Test function manually:
```sql
SELECT * FROM verify_host('paste-host-id-here');
```

### Share Button Not Working
- Check browser console for errors
- Verify clipboard permissions (HTTPS required)
- Test fallback method on older browsers

---

## DATABASE SCHEMA CHANGES

### New Table: verified_members
```sql
CREATE TABLE verified_members (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  cohort text NOT NULL,
  created_at timestamp
);
```

### New Function: verify_host()
```sql
verify_host(host_id uuid)
RETURNS TABLE(
  is_verified boolean,
  matched_cohort text,
  matched_by text
)
```

---

## FILES MODIFIED

### Backend
- `sql/06_verified_members.sql` - New table + function
- `app/api/admin/verify-host/[id]/route.ts` - Verification endpoint

### Frontend
- `app/admin/review/[id]/page.tsx` - Cohort badge display
- `app/events/[id]/page.tsx` - Share button

### Scripts
- `scripts/import-cohort-data.js` - CSV to SQL converter

---

## NEXT STEPS

1. Run SQL schema in Supabase
2. Import CSV data
3. Test verification endpoint
4. Deploy to Vercel
5. Test both features in production

Done!
