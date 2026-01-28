-- 100x Engineers Events Platform
-- Row Level Security (RLS) Policies
-- Execute this AFTER 02_functions.sql

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Anyone can read profiles (for displaying host info)
CREATE POLICY "Profiles are publicly readable"
ON profiles FOR SELECT
USING (true);

-- Users can insert their own profile (onboarding)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- =============================================
-- EVENTS POLICIES
-- =============================================

-- Published events are publicly readable
-- Hosts can see their own events regardless of status
CREATE POLICY "Published events are public or own events"
ON events FOR SELECT
USING (
  status IN ('published', 'completed')
  OR host_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Hosts can create their own events
CREATE POLICY "Hosts can create events"
ON events FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- Admins can update any event
CREATE POLICY "Admins can update events"
ON events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admins can delete events
CREATE POLICY "Admins can delete events"
ON events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- =============================================
-- DAILY_SUBMISSIONS POLICIES
-- =============================================

-- Users can read their own submission count
CREATE POLICY "Users see own daily count"
ON daily_submissions FOR SELECT
USING (host_id = auth.uid());

-- Users can insert/update their own count
CREATE POLICY "Users can track own submissions"
ON daily_submissions FOR ALL
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- =============================================
-- REGISTRATIONS POLICIES
-- =============================================

-- Event hosts can see registrations for their events
CREATE POLICY "Hosts see own event registrations"
ON registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = registrations.event_id
    AND events.host_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Anyone can register for published events (capacity check in app logic)
CREATE POLICY "Anyone can register for published events"
ON registrations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_id
    AND events.status = 'published'
    AND events.current_registrations < events.max_capacity
  )
);

-- Users can view their own registrations
CREATE POLICY "Users see own registrations"
ON registrations FOR SELECT
USING (attendee_email = (SELECT email FROM profiles WHERE id = auth.uid()));
