-- 100x Engineers Events Platform
-- Database Schema Setup
-- Execute this in Supabase SQL Editor

-- =============================================
-- TABLE 1: profiles
-- =============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name: text NOT NULL,
  cohort: text,
  is_admin: boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);

-- =============================================
-- TABLE 2: events
-- =============================================
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

  max_capacity integer CHECK(max_capacity >= 5 AND max_capacity <= 500),
  current_registrations integer DEFAULT 0,

  status text DEFAULT 'submitted'
    CHECK(status IN ('submitted', 'published', 'rejected', 'expired', 'completed')),
  rejection_reason text,

  created_at timestamp DEFAULT now(),
  submitted_at timestamp DEFAULT now(),
  reviewed_at timestamp,
  reviewed_by uuid REFERENCES auth.users(id),
  expires_at timestamp GENERATED ALWAYS AS (submitted_at + interval '7 days') STORED,

  -- Location validation constraints
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
CREATE INDEX idx_events_expires_at ON events(expires_at);

-- =============================================
-- TABLE 3: daily_submissions
-- =============================================
CREATE TABLE daily_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id),
  submission_date date DEFAULT CURRENT_DATE,
  submission_count integer DEFAULT 1 CHECK(submission_count <= 3),
  UNIQUE(host_id, submission_date)
);

CREATE INDEX idx_daily_submissions_host_date ON daily_submissions(host_id, submission_date);

-- =============================================
-- TABLE 4: registrations
-- =============================================
CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  registered_at timestamp DEFAULT now(),
  UNIQUE(event_id, attendee_email)
);

CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_email ON registrations(attendee_email);
