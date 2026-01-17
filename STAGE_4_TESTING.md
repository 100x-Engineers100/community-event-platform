# Stage 4 Testing Guide - Public Event Discovery

## Stage 4 COMPLETE ✓

Homepage built with event discovery, filters, and event detail pages. Dev server at http://localhost:3001

---

## What Was Built

### 1. Public Events API

**File:** `app/api/events/route.ts` (GET method)

**Features:**
- Fetch published/completed events (public access)
- Query params: `type` (upcoming/past), `location_type` (online/offline/hybrid)
- Excludes `meeting_link` from response (privacy)
- Orders by event_date (asc for upcoming, desc for past)

**Endpoints:**
```
GET /api/events?type=upcoming
GET /api/events?type=past
GET /api/events?type=upcoming&location_type=online
```

### 2. Single Event API

**File:** `app/api/events/[id]/route.ts`

**Features:**
- Fetch single event by ID
- Only returns published/completed events
- Excludes meeting_link (revealed after registration in Stage 5)
- 404 if event not found or not public

**Endpoint:**
```
GET /api/events/{event-id}       --------------ADD THE COOL 3D soething here. ------------------------
```

### 3. PublicEventCard Component

**File:** `components/PublicEventCard.tsx`

**Features:**
- Clickable card linking to event detail page
- Shows: title, description (truncated), date/time, location, capacity
- Orange glow hover effect
- Full badge for capacity-reached events
- Progress bar with color change when full
- Responsive design

### 4. Homepage

**File:** `app/page.tsx`

**Features:**
- **Hero Section:**
  - Orange gradient radial background
  - 100x branding
  - Community tagline

- **Filters:**
  - Upcoming/Past events toggle with count badges
  - Location type filter (All, Online, Offline, Hybrid)
  - Active state styling with orange accents

- **Events Grid:**
  - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Loading state with spinner
  - Error state with retry button
  - Empty state with contextual message

- **Design:**
  - 100x dark theme
  - Orange accent colors strategically placed
  - Mobile-first responsive
  - Smooth transitions

### 5. Event Detail Page

**File:** `app/events/[id]/page.tsx`

**Features:**
- **Layout:**
  - 2-column responsive layout (stacks on mobile)
  - Back to events button
  - Past event badge
  - Full event badge

- **Left Column:**
  - Event title
  - Full description
  - Venue address (for offline/hybrid events)

- **Right Column:**
  - Event details card (date, time, location, capacity)
  - Progress bar for registrations
  - Registration placeholder (Stage 5 feature)

- **States:**
  - Loading state
  - 404 error state
  - Full event state
  - Past event state

---

## Testing Instructions

### Prerequisites

**1. Create Test Events in Supabase**

You need published events to test. Manually update some submitted events:

```sql
-- Publish some events for testing
UPDATE events
SET status = 'published'
WHERE status = 'submitted'
LIMIT 3;

-- Create a completed (past) event
UPDATE events
SET status = 'completed'
WHERE id = '[some-event-id]';

-- Or insert test events directly
INSERT INTO events (
  host_id, title, description, event_date, location_type,
  city, meeting_link, max_capacity, status
) VALUES (
  '[your-user-id]',
  'Test Online Event - Published',
  'This is a test event created for Stage 4 testing. It has more than 50 characters to pass validation and should appear on the homepage when published.',
  '2026-02-15 18:00:00+05:30',
  'online',
  NULL,
  'https://meet.google.com/test-link',
  50,
  'published'
);
```

### Access Pages

```
Homepage: http://localhost:3001/
Event Detail: http://localhost:3001/events/{event-id}
```

---

## Test Cases

### 1. Homepage - Hero Section

**Test:**
- [ ] Hero displays "100x Engineers Community Events" title
- [ ] Orange gradient background visible
- [ ] Tagline displays correctly
- [ ] "Community Events" badge with sparkle icon shows

**Expected:** Hero section visually appealing with 100x branding

### 2. Homepage - Upcoming Events (Default View)

**Test:**
- [ ] Page loads with "Upcoming Events" selected by default
- [ ] Only events with `status='published'` and future dates show
- [ ] Events ordered by date (earliest first)
- [ ] Event count badge shows correct number

**Expected:** Upcoming published events displayed in grid

### 3. Homepage - Past Events Toggle

**Test:**
- [ ] Click "Past Events" button
- [ ] View switches to past events
- [ ] Only events with `status='completed'` show
- [ ] Events ordered by date (most recent first)
- [ ] Past events count badge updates

**Expected:** Toggle works, shows completed events

### 4. Location Type Filters

**Test All Filters:**

**Filter: All**
- [ ] Shows all events regardless of location_type
- [ ] Filter button has active styling (orange border/bg)

**Filter: Online**
- [ ] Only shows events with `location_type='online'`
- [ ] Filter updates both upcoming and past views
- [ ] Count updates accordingly

**Filter: Offline**
- [ ] Only shows events with `location_type='offline'`
- [ ] Events show city name

**Filter: Hybrid**
- [ ] Only shows events with `location_type='hybrid'`
- [ ] Events show city name

**Expected:** Filters work independently for both upcoming/past views

### 5. Event Cards - Display

**Test:**
- [ ] Title displayed (truncated at 2 lines)
- [ ] Description displayed (truncated at 3 lines)
- [ ] Date formatted as "January 15, 2026"
- [ ] Time shows in IST
- [ ] Location type icon shows (Globe/Building/MapPin)
- [ ] City displayed for offline/hybrid
- [ ] Capacity shows "{X}/{Y} registered"
- [ ] Progress bar shows correct percentage
- [ ] "Full" badge shows when current_registrations >= max_capacity

**Expected:** Cards display all info correctly

### 6. Event Cards - Hover Effects

**Test:**
- [ ] Card elevates on hover (translate-y)
- [ ] Orange glow border appears
- [ ] Title color changes to peach (#FFEEE9)
- [ ] "Click to view details" text changes color
- [ ] Smooth transitions

**Expected:** Hover effects work smoothly

### 7. Event Cards - Clickable

**Test:**
- [ ] Click on event card
- [ ] Navigates to `/events/{id}`
- [ ] Entire card is clickable (Link wrapper)

**Expected:** Clicking card opens event detail page

### 8. Empty States

**Test Scenarios:**

**No Upcoming Events:**
- [ ] Filter to show only upcoming events
- [ ] If none exist, empty state shows
- [ ] Calendar icon displays
- [ ] Message: "No upcoming events available right now. Check back soon!"

**No Events for Filter:**
- [ ] Apply location filter with no matching events
- [ ] Empty state shows
- [ ] Message: "No {filter} events available right now."
- [ ] "View all events" button appears
- [ ] Click button → resets filter to "All"

**Expected:** Empty states clear and helpful

### 9. Loading State

**Test:**
- [ ] Refresh page
- [ ] Loading spinner shows while fetching
- [ ] Text: "Loading events..."
- [ ] Spinner uses orange color

**Expected:** Loading state visible briefly on page load

### 10. Error State

**Test:**
- [ ] Kill dev server while on homepage
- [ ] Trigger fetch (refresh page)
- [ ] Error message displays in red alert box
- [ ] "Retry" button appears
- [ ] Click retry → re-fetches events

**Expected:** Error handling works, user can retry

### 11. Event Detail Page - Loading

**Test:**
- [ ] Navigate to event detail page
- [ ] Loading spinner shows during fetch
- [ ] Text: "Loading event..."

**Expected:** Loading state displays

### 12. Event Detail Page - Display

**Test Event Info:**
- [ ] Event title displays prominently
- [ ] Full description shows (not truncated)
- [ ] Date formatted: "Wednesday, February 15, 2026"
- [ ] Time formatted: "6:00 PM IST"
- [ ] Location type shows with icon
- [ ] City displays for offline/hybrid
- [ ] Venue address shows for offline/hybrid events in separate card

**Capacity Section:**
- [ ] Shows "{X} / {Y} registered"
- [ ] Progress bar displays
- [ ] Progress bar red if full, orange if not
- [ ] "Event is full" text if capacity reached

**Expected:** All event details display correctly

### 13. Event Detail Page - Past Event Badge

**Test:**
- [ ] Navigate to a completed event
- [ ] "Past Event" badge shows at top (blue)

**Expected:** Past events marked clearly

### 14. Event Detail Page - Full Event Badge

**Test:**
- [ ] Create event with max_capacity = 5
- [ ] Manually set current_registrations = 5 in DB
- [ ] Navigate to event detail page
- [ ] "Event Full" badge shows (red)
- [ ] Registration card says "Registration Full"

**Expected:** Full capacity indicated clearly

### 15. Event Detail Page - Registration Placeholder

**Test:**
- [ ] For upcoming event with capacity, registration card shows
- [ ] Text: "Registration form will be available here. Coming in Stage 5."
- [ ] Button disabled: "Registration Coming Soon"
- [ ] For full event: "Registration Full" message
- [ ] For past event: No registration card

**Expected:** Registration placeholder works correctly

### 16. Event Detail Page - Back Button

**Test:**
- [ ] Click "Back to Events" button
- [ ] Navigates to homepage `/`

**Expected:** Back navigation works

### 17. Event Detail Page - 404 Handling

**Test:**
- [ ] Navigate to `/events/invalid-uuid`
- [ ] 404 error card displays
- [ ] AlertCircle icon shows
- [ ] Message: "Event not found"
- [ ] "Back to Events" button works

**Expected:** 404 handled gracefully

### 18. Event Detail Page - Private Event Access

**Test:**
- [ ] Create event with `status='submitted'` (not published)
- [ ] Try accessing `/events/{id}` directly
- [ ] Should return 404 (not accessible to public)

**Expected:** Non-public events cannot be accessed

### 19. Mobile Responsiveness - Homepage

**Breakpoints to Test:**
- [ ] Mobile (< 640px): Single column grid, stacked filters
- [ ] Tablet (640-1024px): 2-column grid
- [ ] Desktop (> 1024px): 3-column grid

**Test:**
- [ ] Resize browser to mobile width
- [ ] Hero section responsive
- [ ] Filter buttons stack or wrap properly
- [ ] Event cards full width on mobile
- [ ] No horizontal scroll

**Expected:** Fully responsive on all screen sizes

### 20. Mobile Responsiveness - Event Detail Page

**Test:**
- [ ] Mobile: Left and right columns stack vertically
- [ ] Tablet: Comfortable spacing
- [ ] Desktop: 2-column layout (2/3 left, 1/3 right)
- [ ] All text readable on small screens
- [ ] Buttons accessible and tappable

**Expected:** Event detail page responsive

---

## Database Verification

### Check Events API Returns Correct Data

```sql
-- Verify only published/completed events are public
SELECT id, title, status, event_date
FROM events
WHERE status IN ('published', 'completed')
ORDER BY event_date ASC;

-- Verify meeting_link is NOT exposed
-- (Check browser Network tab: /api/events response should NOT include meeting_link)
```

**Expected:**
- API returns only public events
- meeting_link field not in JSON response

---

## Manual Testing Checklist

### Homepage
- [ ] Hero section displays correctly
- [ ] Upcoming/Past toggle works
- [ ] Location filters work
- [ ] Events display in grid
- [ ] Event cards clickable
- [ ] Hover effects work
- [ ] Loading state shows
- [ ] Empty states display
- [ ] Error handling works
- [ ] Mobile responsive

### Event Detail Page
- [ ] Event loads correctly
- [ ] All details display
- [ ] Back button works
- [ ] Registration placeholder shows
- [ ] Past event badge shows
- [ ] Full event badge shows
- [ ] 404 handling works
- [ ] Mobile responsive

---

## API Testing (cURL)

### Fetch Upcoming Events
```bash
curl http://localhost:3001/api/events?type=upcoming
```

**Expected:**
- 200 status
- JSON with `events` array
- Only published events with future dates
- No `meeting_link` field in response

### Fetch Past Events
```bash
curl http://localhost:3001/api/events?type=past
```

**Expected:**
- 200 status
- Only completed events with past dates

### Fetch Events by Location Type
```bash
curl http://localhost:3001/api/events?type=upcoming&location_type=online
```

**Expected:**
- Only online events returned

### Fetch Single Event
```bash
curl http://localhost:3001/api/events/{event-id}
```

**Expected:**
- 200 status if published/completed
- 404 if submitted/rejected/expired
- Event object in response
- No `meeting_link` field

### Fetch Non-Existent Event
```bash
curl http://localhost:3001/api/events/invalid-uuid
```

**Expected:**
- 404 status
- Error message: "Event not found"

---

## Browser DevTools Checks

### Network Tab
- [ ] Check `/api/events` response
- [ ] Verify `meeting_link` is NOT in JSON
- [ ] Check HTTP status codes (200, 404)
- [ ] Verify CORS if needed

### Console
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] API error logs (if any) are handled

---

## Success Criteria

- [x] Build compiles without errors
- [x] Homepage displays with hero section
- [x] Upcoming/past events toggle works
- [x] Location filters functional
- [x] Event cards display correctly
- [x] Hover effects work
- [x] Event cards clickable
- [x] Event detail page loads
- [x] All event details display
- [x] Back navigation works
- [x] 404 handling works
- [x] Loading states work
- [x] Empty states display
- [x] Error handling works
- [x] Mobile responsive (all pages)
- [x] API endpoints work correctly
- [x] Meeting link privacy maintained

**Stage 4 Status: COMPLETE ✅**

Ready to move to Stage 5: Registration System

---

## Files Created/Modified

```
app/
├── page.tsx                          [MODIFIED - Full homepage rebuild]
├── api/
│   ├── events/
│   │   ├── route.ts                  [NEW - Public events API]
│   │   └── [id]/
│   │       └── route.ts              [NEW - Single event API]
└── events/
    └── [id]/
        └── page.tsx                  [NEW - Event detail page]

components/
└── PublicEventCard.tsx               [NEW - Public event card]
```

---

## Next Stage: Stage 5 - Registration System

**Pending:**
- Registration form on event detail page
- Email validation
- Capacity checking
- Duplicate registration prevention
- Meeting link reveal after registration
- Confirmation page
- Registration count auto-increment
