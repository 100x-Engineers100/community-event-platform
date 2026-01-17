-- 100x Engineers Events Platform
-- Database Functions
-- Execute this AFTER 01_schema.sql

-- =============================================
-- FUNCTION 1: Check if user can submit event today
-- =============================================
CREATE OR REPLACE FUNCTION can_submit_event(user_id uuid)
RETURNS boolean AS $$
DECLARE
  submission_count_val integer;
BEGIN
  SELECT COALESCE(submission_count, 0) INTO submission_count_val
  FROM daily_submissions
  WHERE host_id = user_id AND submission_date = CURRENT_DATE;

  RETURN submission_count_val < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION 2: Increment daily submission count
-- =============================================
CREATE OR REPLACE FUNCTION increment_daily_count(user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_submissions (host_id, submission_date, submission_count)
  VALUES (user_id, CURRENT_DATE, 1)
  ON CONFLICT (host_id, submission_date)
  DO UPDATE SET submission_count = daily_submissions.submission_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION 3: Mark expired events (not reviewed in 7 days)
-- =============================================
CREATE OR REPLACE FUNCTION mark_expired_events()
RETURNS void AS $$
BEGIN
  UPDATE events
  SET status = 'expired'
  WHERE status = 'submitted'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION 4: Mark completed events (event date passed)
-- =============================================
CREATE OR REPLACE FUNCTION mark_completed_events()
RETURNS void AS $$
BEGIN
  UPDATE events
  SET status = 'completed'
  WHERE status = 'published'
  AND event_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION 5: Auto-increment registration count
-- (Trigger function)
-- =============================================
CREATE OR REPLACE FUNCTION increment_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events
  SET current_registrations = current_registrations + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for registration count
CREATE TRIGGER after_registration_insert
  AFTER INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION increment_registration_count();
