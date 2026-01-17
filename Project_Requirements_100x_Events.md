# 100x Engineers Community Events Platform
## Complete Technical Requirements & Architecture

**Last Updated:** January 13, 2026  
**Tech Stack:** Next.js + Supabase + Google OAuth + Vercel
This project will be accessed on phone and on desktop also. 

---

## EXECUTIVE SUMMARY

**Goal:** Community event platform with 3 user types (Hosts, Joinees, Admins)

**Phase 1 Part 1 - Host Flow:** Event submission & status tracking  
**Phase 1 Part 2 - Joinee Flow:** Event discovery & registration  
**Phase 2 - Admin Flow:** Review & approval system

**Scale:** 10-50 events/month initially, growing organically

/* Base Colors */
--bg-primary: #0A0A0A;          /* Deep black base */
--bg-secondary: #141414;        /* Slightly lighter panels */
--bg-tertiary: #1A1A1A;         /* Cards/elevated surfaces */

/* 100x Brand Colors */
--accent-primary: #F96846;      /* The iconic coral/orange */
--accent-light: #FFEEE9;        /* Soft peach for subtle highlights */
--accent-glow: rgba(249, 104, 70, 0.3);  /* For glow effects */

/* Supporting Colors */
--text-primary: #FFFFFF;
--text-secondary: #A0A0A0;
--text-muted: #666666;
--border-default: #2A2A2A;
--border-accent: #F96846;
```

### **Strategic Orange Usage** 🔥

I recommend a **"Ember & Shadow"** approach - the orange should feel like glowing embers in darkness:

#### **1. High-Impact Moments (Primary Orange)**
- **CTAs**: "Create Event", "Register Now" buttons
- **Active states**: Selected nav items, active filters
- **Status indicators**: "Approved" badges, live event markers
- **Focus states**: Form inputs when active

#### **2. Subtle Accents (Orange Glow)**
- **Hover effects**: Cards with soft orange glow on borders
- **Progress indicators**: Registration capacity bars
- **Dividers**: Thin glowing separator lines
- **Icons**: Small icons in the orange tone

#### **3. Light Peach for Depth**
- **Secondary buttons**: Outline buttons with peach hover
- **Info badges**: "Pending", "2/3 submissions today"
- **Timestamps**: Subtle color for dates/times
- **Tooltips**: Background color for helpful hints

### **Specific Component Ideas**

**Event Cards:**
```
Normal state: Black card (#1A1A1A) with subtle border (#2A2A2A)
Hover: Orange glow border (box-shadow: 0 0 20px rgba(249, 104, 70, 0.2))
        + border color shifts to orange
```

**Buttons:**
```
Primary: Orange background (#F96846) with black text
         Hover: Slightly lighter + subtle pulse animation
         
Secondary: Black with orange border
           Hover: Orange glow effect

Ghost: Transparent with peach text (#FFEEE9)
       Hover: Fill with orange
```

**Navigation:**
```
Default: White text
Active page: Orange text + orange underline glow
Hover: Peach text (#FFEEE9)
```

**Status Badges:**
```
Pending: Peach background with orange border
Approved: Orange background with white text
Rejected: Dark red with white text
Expired: Gray with subtle orange accent

---

## 1. PROJECT REQUIREMENTS

### User Roles

**HOSTS**
- Create events (max 3 per day)
- View submission status
- See registration counts
- Cannot edit after submission

**Profile Fields:**
- Email (from Google)
- Full Name
- Affiliation: 100x Alumni | Current Cohort | Friend of 100x | Partner Community

**JOINEES**  
- Browse published events
- Register for events
- View event details
- Access meeting links (registered only)

**ADMINS (Phase 2)**
- Review pending submissions
- Approve/Reject/Edit events
- Manage all events

---

## 2. EVENT REQUIREMENTS

### Event Fields
- Title (unique, required)
- Description (50-1000 chars, required)
- Date & Time (future, required)
- Location Type: Online | Offline | Hybrid
- Max Capacity: 5-500 (required)

**Conditional Fields:**
- IF Online/Hybrid → Meeting Link (URL, required)
- IF Offline/Hybrid → City (text, required)
- IF Offline → Venue Address (textarea, required)

### Business Rules

**Daily Submission Limit:**
- Host can submit 3 events per day
- Resets at midnight server time
- Tracked in `daily_submissions` table

**Title Uniqueness:**
- Must be globally unique
- Even across completed events
- Validation on form submit

**Event Status Flow:**
```
SUBMITTED → (Admin Review) → PUBLISHED | REJECTED
         → (7 days pass) → EXPIRED
PUBLISHED → (Event happens) → COMPLETED
```

**Auto-Expiry:**
- If not reviewed in 7 days → status = EXPIRED
- Cron job runs daily at 1 AM

**Auto-Completion:**
- After event_date passes → status = COMPLETED
- Cron job runs daily at 2 AM

**Meeting Link Privacy:**
- NOT visible on public event page
- ONLY shown to registered attendees
- Displayed after successful registration

---

## 3. TECHNICAL ARCHITECTURE

### Stack Justification

**Next.js 14+ (App Router)**
- SSR for SEO (public event discovery)
- API routes for backend logic
- Excellent Vercel deployment
- React Server Components

**Supabase (PostgreSQL)**
- Free tier: 500MB DB, 50k users
- Built-in auth (Google OAuth)
- Row-Level Security (RLS)
- Real-time subscriptions
- Automatic backups

**Google OAuth**
- One-click login
- No password management
- Familiar to users
- Free

**Tailwind CSS**
- Utility-first approach
- Mobile-first responsive
- Small bundle size

**Vercel**
- Zero-config deployment
- Automatic HTTPS
- Preview deployments
- Free tier

### Cost Analysis

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Supabase | 500MB DB | ~50 events | $0 |
| Vercel | 100GB bandwidth | Low traffic | $0 |
| Google OAuth | Unlimited | Auth only | $0 |
| **TOTAL** | | | **$0/month** |

**Email Notifications:**
- NOT included in V1 (cost saving)
- Can add Resend.com later (3k emails/month free)

---

## 4. DATABASE SCHEMA

### Table: profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  affiliation text NOT NULL 
    CHECK(affiliation IN (
      '100x Alumni', 'Current Cohort', 
      'Friend of 100x', 'Partner Community'
    )),
  is_admin boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
```

### Table: events
```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id),
  
  title text UNIQUE NOT NULL,
  description text NOT NULL,
  event_date timestamptz NOT NULL,
  
  location_type text NOT NULL 
    CHECK(location_type IN ('online', 'offline', 'hybrid')),
  city text,
  meeting_link text,
  venue_address text,
  
  max_capacity integer CHECK(max_capacity > 0),
  current_registrations integer DEFAULT 0,
  
  status text DEFAULT 'submitted' 
    CHECK(status IN ('submitted', 'published', 'rejected', 'expired', 'completed')),
  rejection_reason text,
  
  created_at timestamp DEFAULT now(),
  submitted_at timestamp DEFAULT now(),
  reviewed_at timestamp,
  reviewed_by uuid REFERENCES auth.users(id),
  expires_at timestamp GENERATED ALWAYS AS (submitted_at + interval '7 days') STORED,
  
  -- Location validation
  CONSTRAINT valid_online CHECK (
    location_type != 'online' OR meeting_link IS NOT NULL
  ),
  CONSTRAINT valid_offline CHECK (
    location_type != 'offline' OR (city IS NOT NULL AND venue_address IS NOT NULL)
  ),
  CONSTRAINT valid_hybrid CHECK (
    location_type != 'hybrid' OR (city IS NOT NULL AND meeting_link IS NOT NULL)
  )
);

CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
```

### Table: daily_submissions
```sql
CREATE TABLE daily_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id),
  submission_date date DEFAULT CURRENT_DATE,
  submission_count integer DEFAULT 1 CHECK(submission_count <= 3),
  UNIQUE(host_id, submission_date)
);
```

### Table: registrations
```sql
CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  registered_at timestamp DEFAULT now(),
  UNIQUE(event_id, attendee_email)
);

CREATE INDEX idx_registrations_event_id ON registrations(event_id);
```

### Database Functions

**Check submission limit:**
```sql
CREATE OR REPLACE FUNCTION can_submit_event(user_id uuid)
RETURNS boolean AS $$
DECLARE submission_count integer;
BEGIN
  SELECT COALESCE(submission_count, 0) INTO submission_count
  FROM daily_submissions
  WHERE host_id = user_id AND submission_date = CURRENT_DATE;
  RETURN submission_count < 3;
END;
$$ LANGUAGE plpgsql;
```

**Increment counter:**
```sql
CREATE OR REPLACE FUNCTION increment_daily_count(user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_submissions (host_id, submission_date, submission_count)
  VALUES (user_id, CURRENT_DATE, 1)
  ON CONFLICT (host_id, submission_date)
  DO UPDATE SET submission_count = daily_submissions.submission_count + 1;
END;
$$ LANGUAGE plpgsql;
```

**Mark expired events (Cron):**
```sql
CREATE OR REPLACE FUNCTION mark_expired_events()
RETURNS void AS $$
BEGIN
  UPDATE events SET status = 'expired'
  WHERE status = 'submitted' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Mark completed events (Cron):**
```sql
CREATE OR REPLACE FUNCTION mark_completed_events()
RETURNS void AS $$
BEGIN
  UPDATE events SET status = 'completed'
  WHERE status = 'published' AND event_date < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Auto-increment registrations:**
```sql
CREATE OR REPLACE FUNCTION increment_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events 
  SET current_registrations = current_registrations + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_registration_insert
  AFTER INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION increment_registration_count();
```

---

## 5. AUTHENTICATION FLOW

### Google OAuth Setup

**Supabase Config:**
1. Enable Google provider in Auth settings
2. Get OAuth credentials from Google Cloud Console
3. Add redirect URI: `https://[project].supabase.co/auth/v1/callback`

**Frontend Flow:**
```javascript
// Sign in
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: '/auth/callback' }
})

// Check session
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

### First-Time User (Onboarding)

After Google login, if no profile exists:
1. Redirect to /onboarding
2. Collect: Full Name + Affiliation
3. Insert into profiles table
4. Redirect to /dashboard

---

## 6. USER FLOWS

### PHASE 1 PART 1: HOST FLOW

**Pages:**
- `/login` - Google OAuth
- `/onboarding` - Profile setup
- `/dashboard` - View submissions
- `/create-event` - Submit event

**Host Journey:**
```
1. Visit site → Click "Host Event"
2. Login with Google
3. (First time) Complete onboarding
4. Dashboard shows:
   - Create Event button (if < 3 today)
   - List of events with status
   - Banner if any expired
5. Click "Create Event"
6. Fill form → Submit
7. Event status = SUBMITTED
8. Check back later for approval
```

**Dashboard Features:**
- Status badges: Pending (yellow), Approved (green), Rejected (red), Expired (gray), Completed (blue)
- Registration count for approved events
- Expired event banner: "Your event 'X' expired. Please resubmit."
- Daily limit indicator: "2/3 submissions today"

### PHASE 1 PART 2: JOINEE FLOW

**Pages:**
- `/` - Homepage (public events)
- `/events/[id]` - Event details
- `/events/[id]/confirmation` - Post-registration

**Joinee Journey:**
```
1. Visit homepage
2. Browse upcoming events
3. Click event → See details
4. Fill registration form (name + email)
5. Submit → Confirmation page
6. See meeting link (if online/hybrid)
```

**Homepage Features:**
- Upcoming events (published, future dates)
- Past events (completed)
- Filter by location type
- Capacity indicator (12/50 registered)
- "Full" badge if at capacity

---

## 7. EVENT LIFECYCLE STATE MACHINE

```
                    SUBMITTED
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    7 DAYS          ADMIN           ADMIN
     PASS          REJECT         APPROVE
        │               │               │
        ▼               ▼               ▼
    EXPIRED        REJECTED        PUBLISHED
                                        │
                                 EVENT DATE
                                   PASSES
                                        │
                                        ▼
                                   COMPLETED
```

**Transitions:**
- submitted → published: Admin approval
- submitted → rejected: Admin rejection
- submitted → expired: 7 days pass
- published → completed: Event date passes

**Visibility:**
| Status | Public | Can Register | Shows to Host |
|--------|--------|--------------|---------------|
| submitted | No | No | Yes (Pending) |
| published | Yes | Yes | Yes (Approved) |
| rejected | No | No | Yes (Rejected + Reason) |
| expired | No | No | Yes (Expired + Banner) |
| completed | Yes (Past) | No | Yes (Completed + Count) |

---

## 8. API ENDPOINTS

### Authentication
```
POST /api/auth/signup
GET  /api/auth/user
POST /api/auth/logout
```

### Host
```
GET  /api/host/events          # My events
POST /api/host/events          # Create event
GET  /api/host/can-submit      # Check daily limit
```

### Public
```
GET  /api/events               # Published events
GET  /api/events/[id]          # Event details
POST /api/events/[id]/register # Register
```

### Admin (Phase 2)
```
GET  /api/admin/events         # All events
PUT  /api/admin/events/[id]/approve
PUT  /api/admin/events/[id]/reject
PUT  /api/admin/events/[id]    # Edit event
```

---

## 9. FRONTEND STRUCTURE

```
app/
├── page.jsx                    # Homepage
├── login/page.jsx
├── onboarding/page.jsx
├── dashboard/page.jsx
├── create-event/page.jsx
├── events/
│   └── [id]/
│       ├── page.jsx
│       └── confirmation/page.jsx
└── admin/ (Phase 2)
    ├── dashboard/
    ├── pending/
    └── review/[id]/

components/
├── Navigation.jsx
├── EventCard.jsx
├── RegistrationForm.jsx
└── StatusBadge.jsx

lib/
├── supabase.js
└── utils.js
```

---

## 10. IMPLEMENTATION STAGES

### Stage 1: Foundation (Week 1)
- [ ] Set up Next.js + Supabase
- [ ] Configure Google OAuth
- [ ] Create all database tables
- [ ] Set up RLS policies
- [ ] Deploy to Vercel

### Stage 2: Host Dashboard (Week 2)
- [ ] Build /dashboard page
- [ ] Fetch & display events
- [ ] Add status badges
- [ ] Implement expired banner

### Stage 3: Event Creation (Week 2-3)
- [ ] Build /create-event form
- [ ] Implement validation
- [ ] Check daily limit
- [ ] Handle submission

### Stage 4: Public Discovery (Week 3)
- [ ] Build homepage
- [ ] Display published events
- [ ] Add filters
- [ ] Build event detail page

### Stage 5: Registration (Week 4)
- [ ] Build registration form
- [ ] Validate email
- [ ] Check capacity
- [ ] Show meeting link to registered users

### Stage 6: Automation (Week 4)
- [ ] Set up cron jobs
- [ ] Test expiry logic
- [ ] Test completion logic

### Stage 7: Admin Panel (Week 5-6)
- [ ] Build admin dashboard
- [ ] Implement approval flow
- [ ] Implement rejection flow
- [ ] Add admin editing

### Stage 8: Polish (Week 7)
- [ ] Mobile responsive testing
- [ ] Error handling
- [ ] Performance optimization
- [ ] User testing

---

## 11. TESTING CHECKLIST

### Authentication
- [ ] Google OAuth works
- [ ] Onboarding saves profile
- [ ] Session persists
- [ ] Logout clears session

### Host Flow
- [ ] Dashboard shows correct events
- [ ] Daily limit enforced
- [ ] Cannot submit duplicate title
- [ ] Cannot edit after submission
- [ ] Expired banner appears

### Joinee Flow
- [ ] Homepage shows published events only
- [ ] Filters work
- [ ] Meeting link hidden until registered
- [ ] Cannot register twice
- [ ] Cannot register if full

### Automation
- [ ] Events expire after 7 days
- [ ] Events complete after event date
- [ ] Cron jobs run on schedule

### Edge Cases
- [ ] Concurrent registrations respect capacity
- [ ] Timezones display correctly
- [ ] Daily limit resets at midnight

---

## 12. DEPLOYMENT

**Supabase:**
1. Create project at supabase.com
2. Run SQL schema in SQL Editor
3. Enable Google OAuth
4. Set up cron jobs (pg_cron or Edge Functions)

**Vercel:**
1. Connect GitHub repo
2. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Deploy

**Domain:**
- Use Vercel default: `events-100x.vercel.app`
- Or custom domain: `events.100xengineers.com`

---

## 13. PHASE 2: ADMIN FLOW

### Admin Dashboard

**Pages:**
- `/admin/dashboard` - Overview stats
- `/admin/pending` - Pending submissions queue
- `/admin/review/[id]` - Approve/Reject/Edit interface

**Features:**
- View all pending events
- Approve → status = published
- Reject → save rejection_reason
- Edit → modify before approval

**Access Control:**
```sql
-- Manually set admins
UPDATE profiles SET is_admin = true 
WHERE email = 'admin@100xengineers.com';
```

---

## 14. FUTURE ENHANCEMENTS

**Post-MVP (Priority Order):**

1. **Email Notifications** (High)
   - Approval/rejection emails
   - Registration confirmations
   - Event reminders
   - Use Resend.com (free tier)

2. **Event Editing** (Medium)
   - Hosts edit drafts
   - Admins request changes

3. **Categories/Tags** (Medium)
   - AI, Web Dev, Data Science
   - Filter by category

4. **Waitlist** (Medium)
   - Join if event full
   - Auto-promote on cancellation

5. **Calendar Integration** (Medium)
   - Add to Google Calendar
   - ICS file download

6. **Analytics** (Low)
   - Registration trends
   - Geographic distribution
   - Export attendee list

7. **Rich Text Editor** (Low)
   - WYSIWYG for descriptions
   - Image uploads

8. **Payments** (Future)
   - Paid events (Stripe/Razorpay)
   - Ticketing system

---

## 15. CRITICAL NOTES

### Security
- All sensitive data in RLS-protected tables
- Meeting links only visible to registered users
- Admin routes protected by middleware
- No hardcoded secrets in code

### Performance
- Use indexes on foreign keys
- Cache published events (Next.js)
- Lazy load past events
- Optimize images (Next.js Image)

### Scalability
- Current design: 10-50 events/month
- Free tier supports 500 events total
- Can scale to 1000+ events with same stack
- Payment required after 500MB DB

### Maintenance
- Supabase auto-backups daily
- Monitor cron job logs
- Check error rates in Vercel
- Update dependencies monthly

---

## 16. CONTACT & SUPPORT

**Issues:** Report via GitHub Issues  
**Questions:** 100x Engineers Slack  
**Bugs:** Create detailed bug report with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots
- Browser/device info

---

## APPENDIX: QUICK REFERENCE

### Key URLs (Production)
- Homepage: https://events-100x.vercel.app
- Admin: https://events-100x.vercel.app/admin
- Supabase: https://app.supabase.com/project/[ref]

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (server only)
```

### Useful SQL Queries

**Check daily submissions:**
```sql
SELECT * FROM daily_submissions 
WHERE host_id = 'user-id' AND submission_date = CURRENT_DATE;
```

**Get pending events:**
```sql
SELECT * FROM events 
WHERE status = 'submitted' 
ORDER BY submitted_at ASC;
```

**Get upcoming events:**
```sql
SELECT * FROM events 
WHERE status = 'published' AND event_date > NOW()
ORDER BY event_date ASC;
```

---

**Document Version:** 1.0  
**Last Updated:** January 13, 2026  
**Author:** Buildallday & Claude (100xEngineers)

