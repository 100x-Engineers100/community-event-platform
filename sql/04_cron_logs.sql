-- Cron Job Execution Logs Table
-- Tracks all automated task executions for monitoring and debugging

CREATE TABLE IF NOT EXISTS cron_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job identification
  job_name text NOT NULL,
  job_type text NOT NULL CHECK(job_type IN ('expire_events', 'complete_events')),

  -- Execution details
  executed_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK(status IN ('success', 'error')),

  -- Results
  events_affected integer DEFAULT 0,
  error_message text,

  -- Metadata
  execution_time_ms integer,
  triggered_by text DEFAULT 'vercel_cron' -- Can be 'vercel_cron' or 'manual'
);

-- Index for querying logs by job type and date
CREATE INDEX idx_cron_logs_job_type ON cron_logs(job_type);
CREATE INDEX idx_cron_logs_executed_at ON cron_logs(executed_at DESC);
CREATE INDEX idx_cron_logs_status ON cron_logs(status);

-- Add comment for documentation
COMMENT ON TABLE cron_logs IS 'Tracks automated cron job executions for event status transitions';
