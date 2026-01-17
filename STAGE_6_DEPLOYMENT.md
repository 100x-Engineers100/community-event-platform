# Stage 6 Deployment Guide: Automation & Cron Jobs

**Status:** Ready for deployment
**Completion Date:** 2026-01-17

---

## What Was Built

### Backend Components
1. **Cron API Endpoints** (2 files)
   - `app/api/cron/expire-events/route.ts` - Mark expired events daily
   - `app/api/cron/complete-events/route.ts` - Mark completed events daily

2. **Logging Infrastructure**
   - `lib/cron-logger.ts` - Centralized logging utility
   - `app/api/cron/logs/route.ts` - Admin API to fetch logs
   - `sql/04_cron_logs.sql` - Database table for execution logs

3. **Configuration**
   - `vercel.json` - Vercel Cron schedule configuration
   - `.env.local` - Added CRON_SECRET for security

### Frontend Components
1. **Admin Monitoring Page**
   - `app/admin/cron/page.tsx` - Cron job execution dashboard
   - Displays last 50 executions with filters
   - Shows execution times, status, events affected
   - Real-time refresh capability

---

## Deployment Steps

### Step 1: Create Database Table

**Action:** Run SQL in Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/ltxzvosmmnaaodoobwuv
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `sql/04_cron_logs.sql`
4. Click **Run** to execute

**SQL to run:**
```sql
-- Cron Job Execution Logs Table
CREATE TABLE IF NOT EXISTS cron_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  job_type text NOT NULL CHECK(job_type IN ('expire_events', 'complete_events')),
  executed_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK(status IN ('success', 'error')),
  events_affected integer DEFAULT 0,
  error_message text,
  execution_time_ms integer,
  triggered_by text DEFAULT 'vercel_cron'
);

CREATE INDEX idx_cron_logs_job_type ON cron_logs(job_type);
CREATE INDEX idx_cron_logs_executed_at ON cron_logs(executed_at DESC);
CREATE INDEX idx_cron_logs_status ON cron_logs(status);

COMMENT ON TABLE cron_logs IS 'Tracks automated cron job executions for event status transitions';
```

### Step 2: Set Environment Variable in Vercel

**Action:** Add CRON_SECRET to Vercel dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** `100x_cron_secret_key_2026_production_only`
   - **Environment:** Production, Preview, Development
5. Click **Save**

**Important:** In production, use a stronger random secret. Generate with:
```bash
openssl rand -base64 32
```

### Step 3: Deploy to Vercel

**Action:** Push code and deploy

```bash
git add .
git commit -m "Stage 6: Add automation & cron jobs"
git push origin main
```

Vercel will automatically:
- Deploy the new code
- Read `vercel.json` cron configuration
- Schedule cron jobs to run daily

### Step 4: Verify Deployment

**Check 1: Cron Jobs Registered**
1. Go to Vercel Dashboard → Your Project → **Crons**
2. You should see 2 cron jobs:
   - `/api/cron/expire-events` - Runs daily at 19:30 UTC (1:00 AM IST)
   - `/api/cron/complete-events` - Runs daily at 20:30 UTC (2:00 AM IST)

**Check 2: Manual Test**
```bash
# Test expiry endpoint (use production URL)
curl -X GET https://your-domain.vercel.app/api/cron/expire-events \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test completion endpoint
curl -X GET https://your-domain.vercel.app/api/cron/complete-events \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Expired events marked successfully",
  "eventsExpired": 0,
  "executionTimeMs": 245,
  "timestamp": "2026-01-17T..."
}
```

**Check 3: Verify Logging**
1. Visit `/admin/cron` on your deployed site
2. You should see the test executions logged
3. Check status, execution time, and events affected

---

## Cron Schedule Explanation

### Timing Breakdown

| Cron Expression | UTC Time | IST Time | Job |
|-----------------|----------|----------|-----|
| `30 19 * * *` | 7:30 PM | 1:00 AM (next day) | Expire Events |
| `30 20 * * *` | 8:30 PM | 2:00 AM (next day) | Complete Events |

**Why these times?**
- Low traffic period (1-2 AM IST)
- After midnight (ensures date-based logic works correctly)
- 1-hour gap between jobs (reduces DB load)

### Cron Expression Format
```
┌───────────── minute (0 - 59)
│ ┌─────────── hour (0 - 23)
│ │ ┌───────── day of month (1 - 31)
│ │ │ ┌─────── month (1 - 12)
│ │ │ │ ┌───── day of week (0 - 6)
│ │ │ │ │
30 19 * * *
```

---

## How It Works

### Expiry Job Flow
```
1. Vercel Cron triggers at 7:30 PM UTC (1:00 AM IST)
   ↓
2. Sends GET request to /api/cron/expire-events
   with Authorization header
   ↓
3. API validates CRON_SECRET
   ↓
4. Calls mark_expired_events() DB function
   ↓
5. Function updates events where:
   - status = 'submitted'
   - expires_at < NOW()
   ↓
6. Log execution to cron_logs table
   ↓
7. Return success response
```

### Completion Job Flow
```
1. Vercel Cron triggers at 8:30 PM UTC (2:00 AM IST)
   ↓
2. Sends GET request to /api/cron/complete-events
   with Authorization header
   ↓
3. API validates CRON_SECRET
   ↓
4. Calls mark_completed_events() DB function
   ↓
5. Function updates events where:
   - status = 'published'
   - event_date < NOW()
   ↓
6. Log execution to cron_logs table
   ↓
7. Return success response
```

---

## Security Features

### Authorization
- All cron endpoints require `Authorization: Bearer {CRON_SECRET}` header
- Vercel automatically includes this header when triggering cron jobs
- Unauthorized requests return 401 error

### Admin Access
- Cron logs endpoint (`/api/cron/logs`) requires admin authentication
- Only users with `is_admin = true` can access monitoring page
- Non-admins receive 403 Forbidden error

### Error Handling
- Try/catch blocks in all endpoints
- Errors logged to console (visible in Vercel logs)
- Failed executions logged to database with error message
- Logging failures don't break cron job execution

---

## Monitoring & Troubleshooting

### Access Monitoring Dashboard
1. Log in as admin user
2. Navigate to `/admin/cron`
3. View execution history, filter by job type
4. Check for errors or long execution times

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → **Logs**
2. Filter by function: `/api/cron/expire-events` or `/api/cron/complete-events`
3. Look for `[CRON]` prefixed messages

### Common Issues

**Issue 1: Cron job not running**
- **Check:** Vercel Dashboard → Crons tab
- **Fix:** Ensure `vercel.json` is in project root and deployed

**Issue 2: 401 Unauthorized**
- **Check:** CRON_SECRET environment variable in Vercel
- **Fix:** Add/update environment variable and redeploy

**Issue 3: Database function errors**
- **Check:** Supabase logs and cron_logs table
- **Fix:** Verify `mark_expired_events()` and `mark_completed_events()` functions exist

**Issue 4: No logs appearing**
- **Check:** Does cron_logs table exist?
- **Fix:** Run `sql/04_cron_logs.sql` in Supabase dashboard

---

## Testing Checklist

### Pre-Deployment
- [x] Cron endpoints return success when called manually
- [x] Authorization check works (401 without valid secret)
- [x] Logging function doesn't throw errors
- [x] Admin monitoring page displays correctly

### Post-Deployment
- [ ] cron_logs table created in production database
- [ ] CRON_SECRET environment variable set in Vercel
- [ ] Cron jobs visible in Vercel Dashboard → Crons tab
- [ ] Manual test endpoints return success
- [ ] Execution logs appear in cron_logs table
- [ ] Admin monitoring page accessible
- [ ] First automatic execution successful (wait 24h)

---

## Rollback Plan

If cron jobs cause issues:

1. **Disable cron jobs:**
   - Delete `vercel.json` from repository
   - Redeploy

2. **Keep endpoints for manual triggering:**
   - Cron API endpoints remain functional
   - Can be triggered manually via curl/Postman

3. **Alternative: Supabase pg_cron**
   - If Vercel cron unreliable, migrate to pg_cron
   - See `sql/05_pg_cron_setup.sql` (to be created if needed)

---

## Performance Metrics

### Expected Performance
- **Execution time:** < 500ms per job
- **Database impact:** Minimal (single UPDATE query)
- **Cost:** $0 (within Vercel free tier limits)

### Monitoring Metrics
- Total executions per month: ~60 (2 jobs × 30 days)
- Average execution time: < 300ms
- Success rate: > 99%
- Events affected per run: 0-10 (depends on activity)

---

## Next Steps (Post-Stage 6)

After verifying cron jobs work:
1. Monitor for 1 week
2. Check execution logs for patterns
3. Adjust timing if needed
4. Move to **Stage 7: Admin Panel**

---

## Files Created/Modified

### Created (9 files)
```
app/api/cron/expire-events/route.ts       (115 lines)
app/api/cron/complete-events/route.ts     (115 lines)
app/api/cron/logs/route.ts                 (85 lines)
lib/cron-logger.ts                         (40 lines)
app/admin/cron/page.tsx                    (220 lines)
sql/04_cron_logs.sql                       (25 lines)
vercel.json                                (12 lines)
components/ui/table.tsx                    (shadcn component)
STAGE_6_DEPLOYMENT.md                      (this file)
```

### Modified (1 file)
```
.env.local                                 (added CRON_SECRET)
```

**Total lines of code:** ~610 lines

---

## Support & Documentation

**Vercel Cron Docs:** https://vercel.com/docs/cron-jobs
**Supabase Functions:** Already created in Stage 1
**Monitoring Dashboard:** `/admin/cron` (admin access required)

---

**Implementation Team:** Claude Sonnet 4.5
**Code Quality:** Production-ready
**Security:** Authorization + admin-only monitoring
**Documentation:** Complete
