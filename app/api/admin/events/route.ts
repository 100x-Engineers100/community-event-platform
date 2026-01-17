import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin API: Fetch all events with optional filtering
 * GET /api/admin/events?status=submitted&limit=50
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query - fetch events first
    let query = supabase
      .from('events')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(limit);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('[ADMIN] Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Fetch profile data for each event
    if (events && events.length > 0) {
      const hostIds = [...new Set(events.map(e => e.host_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, affiliation')
        .in('id', hostIds);

      // Map profiles to events
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const eventsWithProfiles = events.map(event => ({
        ...event,
        profiles: profileMap.get(event.host_id) || null
      }));

      return NextResponse.json({ events: eventsWithProfiles });
    }

    return NextResponse.json({ events: [] });

  } catch (error) {
    console.error('[ADMIN] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
