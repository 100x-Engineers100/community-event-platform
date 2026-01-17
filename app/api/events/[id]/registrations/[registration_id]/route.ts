import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/events/[id]/registrations/[registration_id]
 * Fetch registration details including meeting link
 *
 * Security: Only returns data if registration exists for this event
 * This prevents unauthorized access to meeting links
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; registration_id: string }> }
) {
  try {
    const { id: eventId, registration_id: registrationId } = await params;

    const supabase = await createClient();

    // [STEP 1] Fetch registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // [STEP 2] Fetch event details (including meeting_link)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // [STEP 3] Return registration + event details
    // Meeting link is revealed because user has valid registration
    return NextResponse.json({
      registration: {
        id: registration.id,
        attendee_name: registration.attendee_name,
        attendee_email: registration.attendee_email,
        registered_at: registration.registered_at
      },
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        location_type: event.location_type,
        city: event.city,
        venue_address: event.venue_address,
        max_capacity: event.max_capacity,
        current_registrations: event.current_registrations,
        // Meeting link revealed for registered users
        meeting_link: event.meeting_link
      }
    });

  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
