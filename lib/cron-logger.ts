import { SupabaseClient } from '@supabase/supabase-js';

export interface CronLogData {
  jobName: string;
  jobType: 'expire_events' | 'complete_events';
  status: 'success' | 'error';
  eventsAffected: number;
  errorMessage?: string;
  executionTimeMs: number;
  triggeredBy?: string;
}

/**
 * Log cron job execution to database
 * Stores execution history for monitoring and debugging
 */
export async function logCronExecution(
  supabase: SupabaseClient,
  logData: CronLogData
): Promise<void> {
  try {
    const { error } = await supabase.from('cron_logs').insert({
      job_name: logData.jobName,
      job_type: logData.jobType,
      status: logData.status,
      events_affected: logData.eventsAffected,
      error_message: logData.errorMessage,
      execution_time_ms: logData.executionTimeMs,
      triggered_by: logData.triggeredBy || 'vercel_cron'
    });

    if (error) {
      console.error('[CRON_LOG] Failed to log execution:', error);
      // Don't throw - logging failure shouldn't break the cron job
    }
  } catch (error) {
    console.error('[CRON_LOG] Unexpected error logging execution:', error);
    // Silent fail - logging is not critical
  }
}
