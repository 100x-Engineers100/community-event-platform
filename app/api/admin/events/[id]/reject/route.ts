import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin API: Reject event with reason
 * PUT /api/admin/events/[id]/reject
 * Body: { reason: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Validate rejection reason
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Rejection reason required (minimum 10 characters)' },
        { status: 400 }
      );
    }

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
        { error: `Cannot reject event with status: ${event.status}` },
        { status: 400 }
      );
    }

    // Update event status to rejected with reason
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason.trim()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[ADMIN] Error rejecting event:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject event' },
        { status: 500 }
      );
    }

    console.log(`[ADMIN] Event ${id} rejected by ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Event rejected successfully',
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
