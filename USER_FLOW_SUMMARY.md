# 100x Engineers Events Platform - User Flow Summary

**Last Updated:** January 16, 2026

---

## Overview

Community event platform with 3 user types: **Hosts** (create events), **Joinees** (attend events), and **Admins** (verify events).

---

## User Types & Their Flows

### 1. HOST FLOW (Event Creators)

**Profile Information Required:**
- Email (from Google)
- Full Name
- Affiliation: 100x Alumni | Current Cohort | Friend of 100x | Partner Community

**Journey:**
```
Step 1: Visit website → Click "Host Event"
Step 2: Login with Google OAuth
Step 3: Complete profile setup (first-time users only)
        - Enter Full Name
        - Select Affiliation
Step 4: Dashboard Access
        - View all submitted events
        - See event status (Pending/Approved/Rejected/Expired/Completed)
        - Check registration counts
        - Daily submission limit tracker (e.g., "2/3 submissions today")
Step 5: Create Event (max 3 per day)
        - Event Title (must be unique)
        - Description
        - Date & Time
        - Location Type: Online / Offline / Hybrid
        - Max Capacity (5-500 people)
        - Conditional fields based on location:
          * Online/Hybrid → Meeting Link
          * Offline/Hybrid → City
          * Offline → Venue Address
Step 6: Submit for Admin Review
Step 7: Wait for Approval
Step 8: Track registrations once approved
```

**Dashboard Features:**
- Status badges with color coding
- Registration counts for approved events
- Alert banners for expired events
- Daily submission limit indicator

---

### 2. JOINEE FLOW (Event Attendees)

**Registration Information Required:**
- Name
- Email

**Journey:**
```
Step 1: Visit homepage
Step 2: Browse upcoming events (approved events only)
        - Filter by location type (Online/Offline/Hybrid)
        - See capacity indicators (e.g., "12/50 registered")
        - View past completed events
Step 3: Click on event → View full details
        - Title, description, date/time
        - Location information
        - Capacity status
        - Meeting links NOT visible yet
Step 4: Fill registration form
        - Enter Name
        - Enter Email
Step 5: Submit registration
Step 6: Confirmation page
        - Registration confirmed
        - Meeting link NOW visible (for online/hybrid events)
        - Event details summary
```

**Important:** Meeting links are private and only shown AFTER successful registration.

---

### 3. ADMIN FLOW (Event Moderators)

**Responsibilities:**
- Review all pending event submissions
- Approve or reject events
- Edit events before approval if needed
- Verify host authenticity

**Journey:**
```
Step 1: Login as admin
Step 2: Admin dashboard shows:
        - Pending submissions queue
        - All events overview
        - Statistics
Step 3: Review pending events
        - View all event details
        - See host information
        - Check host verification status (NEW FEATURE ↓)
Step 4: Host Verification Check
        - System cross-references host profile against consolidated
          100x Engineers database (C1-C6 cohort members)
        - Verification badge shows:
          ✓ "Verified Member - C3" (if found in database)
          ✗ "Not in Database" (if not found)
        - Helps admin confirm host filled correct cohort details
Step 5: Decision
        - APPROVE → Event goes live to public
        - REJECT → Host notified with reason
        - EDIT → Modify details before approving
```

---

## Event Status Lifecycle

```
┌─────────────────────────────────────────────────────┐
│                     SUBMITTED                       │
│              (Host creates event)                   │
└──────────────┬──────────────────────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
   7 Days   ADMIN   ADMIN
    Pass   Reject  Approve
       │       │       │
       ▼       ▼       ▼
   EXPIRED REJECTED PUBLISHED
                      │
               Event Date Passes
                      │
                      ▼
                  COMPLETED
```

**Status Meanings:**
- **Submitted** - Waiting for admin review (not public)
- **Published** - Approved, visible to public, registration open
- **Rejected** - Not approved, reason shown to host
- **Expired** - Not reviewed within 7 days, host can resubmit
- **Completed** - Event finished, shows in past events

---

## Key Business Rules

1. **Daily Limit:** Hosts can submit max 3 events per day (resets at midnight)

2. **Title Uniqueness:** Event titles must be globally unique (even across old events)

3. **Auto-Expiry:** Events not reviewed in 7 days automatically expire

4. **Auto-Completion:** Events automatically marked complete after event date passes

5. **Privacy:** Meeting links only visible to registered attendees

6. **Capacity Management:** Registration closed when max capacity reached

7. **No Editing:** Hosts cannot edit events after submission (prevents abuse)

---

## NEW FEATURE: Host Verification System

**Problem:** How to verify hosts truthfully filled their cohort/affiliation details?

**Solution:**
- Maintain consolidated database of all 100x Engineers members (C1-C6 cohorts)
- When host signs up, their profile (name + affiliation) is cross-referenced
- Admin panel shows verification status:
  - ✓ **Verified** - Host exists in our member database
  - ✗ **Unverified** - Host not found in database
- Admin can cross-verify before approving events
- Helps maintain community authenticity

**Admin View Example:**
```
Event: "AI Workshop with GPT-4"
Host: John Doe
Email: john@example.com
Affiliation: Current Cohort - C5
Verification: ✓ Verified Member (Found in C5 roster)
Status: Pending Review
```

---

## Dashboard Features Summary

**Host Dashboard:**
- My events list with status
- Daily submission counter
- Registration counts
- Expired event alerts
- Create event button (disabled if 3/3 used)

**Admin Dashboard:**
- Pending submissions queue
- All events overview
- Host verification badges
- Approve/reject/edit controls
- Event statistics

**Joinee Homepage:**
- Upcoming events grid
- Location type filters
- Capacity indicators
- Past events section
- "Full" badges for at-capacity events

---

## Timeline

Events auto-expire if not reviewed in 7 days. Events auto-complete after event date. Hosts can submit 3 events daily.

---

**End of Summary**
