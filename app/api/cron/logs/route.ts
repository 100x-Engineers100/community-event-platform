import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get cron job execution logs
 * For admin monitoring dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const jobType = searchParams.get('job_type');

    // Build query
    let query = supabase
      .from('cron_logs')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(limit);

    // Filter by job type if specified
    if (jobType && (jobType === 'expire_events' || jobType === 'complete_events')) {
      query = query.eq('job_type', jobType);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('[CRON_LOGS] Error fetching logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Get summary statistics
    const { data: stats } = await supabase.rpc('get_cron_stats');

    return NextResponse.json({
      logs: logs || [],
      stats: stats || {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        last_execution: null
      }
    });

  } catch (error) {
    console.error('[CRON_LOGS] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
