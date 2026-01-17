import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin API: Approve event
 * PUT /api/admin/events/[id]/approve
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if event exists and is submitted
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'submitted') {
      return NextResponse.json(
        { error: `Cannot approve event with status: ${event.status}` },
        { status: 400 }
      );
    }

    // Update event status to published
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: 'published',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[ADMIN] Error approving event:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve event' },
        { status: 500 }
      );
    }

    console.log(`[ADMIN] Event ${id} approved by ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Event approved successfully',
      event: updatedEvent
    });

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
