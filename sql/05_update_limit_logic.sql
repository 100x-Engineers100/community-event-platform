-- =============================================
-- UPDATE: Change submission limit logic
-- =============================================

-- 1. Helper Function: Get count of active events for today
CREATE OR REPLACE FUNCTION get_today_active_event_count(user_id uuid)
RETURNS integer AS $$
DECLARE
  active_count integer;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM events
  WHERE host_id = user_id
  AND created_at::date = CURRENT_DATE
  AND status IN ('submitted', 'published');
  
  RETURN active_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefine can_submit_event to use the helper function
CREATE OR REPLACE FUNCTION can_submit_event(user_id uuid)
RETURNS boolean AS $$
DECLARE
  active_count integer;
BEGIN
  active_count := get_today_active_event_count(user_id);
  RETURN active_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
