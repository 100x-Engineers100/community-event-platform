import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logCronExecution } from '@/lib/cron-logger';

/**
 * Cron job to mark events as expired
 * Runs daily at 1 AM IST (7:30 PM UTC previous day)
 * Calls mark_expired_events() database function
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // [SECURITY] Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[CRON] Unauthorized expire-events request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting expire-events job...');

    // Create Supabase client with service role for admin access
    const supabase = await createClient();

    // Call the database function to mark expired events
    const { data, error } = await supabase.rpc('mark_expired_events');

    if (error) {
      const executionTime = Date.now() - startTime;
      console.error('[CRON] Error marking expired events:', error);

      // Log failure to database
      await logCronExecution(supabase, {
        jobName: 'Mark Expired Events',
        jobType: 'expire_events',
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

    // Get count of expired events for logging
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'expired')
      .gte('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const executionTime = Date.now() - startTime;
    const eventsAffected = count || 0;

    console.log(`[CRON] Successfully marked ${eventsAffected} events as expired (${executionTime}ms)`);

    // Log success to database
    await logCronExecution(supabase, {
      jobName: 'Mark Expired Events',
      jobType: 'expire_events',
      status: 'success',
      eventsAffected,
      executionTimeMs: executionTime
    });

    return NextResponse.json({
      success: true,
      message: 'Expired events marked successfully',
      eventsExpired: eventsAffected,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[CRON] Unexpected error in expire-events:', error);

    // Try to log error (may fail if DB is down)
    try {
      const supabase = await createClient();
      await logCronExecution(supabase, {
        jobName: 'Mark Expired Events',
        jobType: 'expire_events',
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
