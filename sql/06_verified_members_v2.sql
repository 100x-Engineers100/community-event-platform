-- UPDATED verify_host function with better matching logic
-- This handles whitespace, case sensitivity, and NULL values

CREATE OR REPLACE FUNCTION verify_host(host_id uuid)
RETURNS TABLE(is_verified boolean, matched_cohort text, matched_by text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN vm.id IS NOT NULL THEN true ELSE false END as is_verified,
    vm.cohort as matched_cohort,
    CASE
      WHEN LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email)) THEN 'email'
      WHEN LOWER(TRIM(vm.full_name)) = LOWER(TRIM(p.full_name)) THEN 'name'
      ELSE NULL
    END as matched_by
  FROM profiles p
  LEFT JOIN verified_members vm ON (
    LOWER(TRIM(vm.email)) = LOWER(TRIM(p.email)) OR
    LOWER(TRIM(vm.full_name)) = LOWER(TRIM(p.full_name))
  )
  WHERE p.id = host_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
