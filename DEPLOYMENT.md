# Deployment Guide - Vercel + Supabase

## Prerequisites
- GitHub account
- Vercel account (free tier)
- Supabase account (free tier)

---

## Step 1: Setup Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region (closest to users)
4. Set strong database password
5. Wait for project to initialize

### 1.2 Run Database Schema
1. Open SQL Editor in Supabase dashboard
2. Execute SQL files in order:
   - `sql/01_schema.sql`
   - `sql/02_functions.sql`
   - `sql/03_rls_policies.sql`
   - `sql/04_cron_logs.sql`
   - `sql/05_update_limit_logic.sql`

### 1.3 Configure Google OAuth
1. Go to Authentication > Providers
2. Enable Google provider
3. Create OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or use existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### 1.4 Get API Keys
1. Go to Project Settings > API
2. Copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - anon/public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role key (`SUPABASE_SERVICE_ROLE_KEY`)

---   

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select framework: Next.js (auto-detected)

### 2.2 Configure Environment Variables

**CRITICAL:** Add these before first deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**How to add:**
1. In Vercel project settings
2. Go to "Environment Variables"
3. Add each variable for all environments (Production, Preview, Development)

### 2.3 Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. You'll get deployment URL: `https://your-project.vercel.app`

---

## Step 3: Setup Cron Jobs (Automated)

Vercel automatically runs cron jobs defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-events",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/complete-events",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Cron jobs run on **paid plans only**. For free tier:

### Manual Alternative (Free Tier)
1. Use external cron service: [cron-job.org](https://cron-job.org)
2. Add jobs:
   - `https://your-project.vercel.app/api/cron/expire-events` (Daily 1 AM)
   - `https://your-project.vercel.app/api/cron/complete-events` (Daily 2 AM)

### Verify Cron Execution
Visit: `https://your-project.vercel.app/admin/cron` (admin dashboard)

---

## Step 4: Verify Deployment

### 4.1 Test Core Flows
1. **Homepage:** Should load published events
2. **Login:** Google OAuth should work
3. **Onboarding:** First-time user profile setup
4. **Create Event:** Submit event (test daily limit)
5. **Registration:** Register for event

### 4.2 Check Database
1. Go to Supabase Table Editor
2. Verify:
   - `profiles` table has your user
   - `events` table has test event
   - `registrations` table has test registration

---

## Troubleshooting

### Build Fails: "Supabase client error"
**Cause:** Missing environment variables

**Fix:**
1. Ensure all 3 env vars are added in Vercel
2. Redeploy: `Deployments > [Latest] > Redeploy`

### OAuth Redirect Error
**Cause:** Wrong redirect URI in Google Console

**Fix:**
1. Verify redirect URI matches: `https://[PROJECT].supabase.co/auth/v1/callback`
2. Check both Google Console and Supabase settings

### Cron Jobs Not Running
**Cause:** Vercel free tier doesn't support cron

**Fix:**
1. Use external cron service (see Step 3)
2. Or upgrade to Vercel Pro ($20/month)

### Events Not Expiring/Completing
**Cause:** Cron jobs not set up

**Fix:**
1. Manually trigger: Visit `/api/cron/expire-events` and `/api/cron/complete-events`
2. Check logs at `/admin/cron`

---

## Production Checklist

- [ ] Supabase project created
- [ ] All SQL scripts executed
- [ ] Google OAuth configured
- [ ] Environment variables added to Vercel
- [ ] Deployment successful
- [ ] Cron jobs configured (or manual alternative)
- [ ] Test event submission works
- [ ] Test registration works
- [ ] Daily limits enforced
- [ ] OAuth login/logout works

---

## Optional: Custom Domain

### Add Custom Domain to Vercel
1. Go to Project Settings > Domains
2. Add domain: `events.yourdomain.com`
3. Update DNS records (Vercel provides instructions)
4. Update Google OAuth redirect URI to new domain

### Update Supabase
1. Add custom domain to allowed redirect URLs
2. Update Google Console redirect URI

---

## Monitoring & Maintenance

### Daily Checks
- Check `/admin/cron` for cron execution logs
- Monitor event submissions
- Review database size (Supabase free tier: 500MB)

### Monthly Tasks
- Review and delete old expired events
- Check Vercel bandwidth usage
- Update dependencies: `npm update`

### Backup Database
Supabase auto-backups daily. To manual backup:
1. Go to Database > Backups
2. Download backup file
3. Store securely

---

## Scaling Considerations

### Free Tier Limits
- **Vercel:** 100GB bandwidth/month
- **Supabase:** 500MB DB, 2GB bandwidth
- **Expected capacity:** 500+ events, 5000+ registrations

### When to Upgrade
- Database > 400MB (upgrade Supabase to $25/month)
- Bandwidth > 80GB (upgrade Vercel to $20/month)
- Need automated cron jobs (upgrade Vercel)

---

## Support

**Issues:** Report at [GitHub Issues](https://github.com/100x-Engineers100/community-event-platform/issues)

**Logs:** Check Vercel deployment logs for errors
