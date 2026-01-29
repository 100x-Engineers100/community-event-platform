-- Create verified_members table for cohort verification
CREATE TABLE verified_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  cohort text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Create indexes for fast lookup
CREATE INDEX idx_verified_members_email ON verified_members(email);
CREATE INDEX idx_verified_members_name ON verified_members(LOWER(full_name));

-- Function to verify host and get cohort info
CREATE OR REPLACE FUNCTION verify_host(host_id uuid)
RETURNS TABLE(is_verified boolean, matched_cohort text, matched_by text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN vm.id IS NOT NULL THEN true ELSE false END as is_verified,
    vm.cohort as matched_cohort,
    CASE
      WHEN vm.email = p.email THEN 'email'
      WHEN LOWER(vm.full_name) = LOWER(p.full_name) THEN 'name'
      ELSE NULL
    END as matched_by
  FROM profiles p
  LEFT JOIN verified_members vm ON (
    vm.email = p.email OR
    LOWER(vm.full_name) = LOWER(p.full_name)
  )
  WHERE p.id = host_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
