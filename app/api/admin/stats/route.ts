import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Admin API: Get dashboard statistics
 * GET /api/admin/stats
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin status
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

    // Fetch all statistics in parallel
    const [
      submittedResult,
      publishedResult,
      rejectedResult,
      expiredResult,
      completedResult,
      totalRegistrationsResult,
      recentSubmissionsResult
    ] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('events')
        .select('*')
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5)
    ]);

    // Fetch profiles for recent submissions
    let recentWithProfiles = [];
    if (recentSubmissionsResult.data && recentSubmissionsResult.data.length > 0) {
      const hostIds = [...new Set(recentSubmissionsResult.data.map(e => e.host_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', hostIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      recentWithProfiles = recentSubmissionsResult.data.map(event => ({
        ...event,
        profiles: profileMap.get(event.host_id) || { full_name: 'Unknown', email: 'unknown@example.com' }
      }));
    }

    const stats = {
      pending: submittedResult.count || 0,
      published: publishedResult.count || 0,
      rejected: rejectedResult.count || 0,
      expired: expiredResult.count || 0,
      completed: completedResult.count || 0,
      totalRegistrations: totalRegistrationsResult.count || 0,
      recentSubmissions: recentWithProfiles
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('[ADMIN] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
