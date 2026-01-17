import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logCronExecution } from '@/lib/cron-logger';

/**
 * Cron job to mark events as completed
 * Runs daily at 2 AM IST (8:30 PM UTC previous day)
 * Calls mark_completed_events() database function
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // [SECURITY] Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[CRON] Unauthorized complete-events request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting complete-events job...');

    // Create Supabase client with service role for admin access
    const supabase = await createClient();

    // Call the database function to mark completed events
    const { data, error } = await supabase.rpc('mark_completed_events');

    if (error) {
      const executionTime = Date.now() - startTime;
      console.error('[CRON] Error marking completed events:', error);

      // Log failure to database
      await logCronExecution(supabase, {
        jobName: 'Mark Completed Events',
        jobType: 'complete_events',
        status: 'error',
        eventsAffected: 0,
        errorMessage: error.message,
        executionTimeMs: executionTime
      });

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Get count of recently completed events for logging
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('event_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .lt('event_date', new Date().toISOString());

    const executionTime = Date.now() - startTime;
    const eventsAffected = count || 0;

    console.log(`[CRON] Successfully marked ${eventsAffected} events as completed (${executionTime}ms)`);

    // Log success to database
    await logCronExecution(supabase, {
      jobName: 'Mark Completed Events',
      jobType: 'complete_events',
      status: 'success',
      eventsAffected,
      executionTimeMs: executionTime
    });

    return NextResponse.json({
      success: true,
      message: 'Completed events marked successfully',
      eventsCompleted: eventsAffected,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[CRON] Unexpected error in complete-events:', error);

    // Try to log error (may fail if DB is down)
    try {
      const supabase = await createClient();
      await logCronExecution(supabase, {
        jobName: 'Mark Completed Events',
        jobType: 'complete_events',
        status: 'error',
        eventsAffected: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: executionTime
      });
    } catch (logError) {
      console.error('[CRON] Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Disable caching for cron endpoints
export const dynamic = 'force-dynamic';
export const revalidate = 0;
