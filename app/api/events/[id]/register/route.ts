import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { registrationDBSchema } from '@/lib/validations/registration';
import { Event } from '@/lib/types';

/**
 * POST /api/events/[id]/register
 * Register for an event
 *
 * Validations:
 * - Event exists and is published
 * - Event is in the future (not past)
 * - Event is not at capacity
 * - Email not already registered (enforced by DB UNIQUE constraint)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    // [STEP 1] Validate request body
    const validationResult = registrationDBSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid registration data',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { attendee_name, attendee_email } = validationResult.data;

    // [STEP 2] Create Supabase client
    const supabase = await createClient();

    // [STEP 3] Fetch event details (including meeting_link for confirmation page)
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

    // [STEP 4] Validate event status (must be published)
    if (event.status !== 'published') {
      return NextResponse.json(
        {
          error: 'Event is not available for registration',
          details: 'Event must be published to accept registrations'
        },
        { status: 400 }
      );
    }

    // [STEP 5] Validate event date (must be in the future)
    const eventDate = new Date(event.event_date);
    const now = new Date();

    if (eventDate <= now) {
      return NextResponse.json(
        {
          error: 'Cannot register for past events',
          details: 'This event has already occurred'
        },
        { status: 400 }
      );
    }

    // [STEP 6] Check capacity
    if (event.current_registrations >= event.max_capacity) {
      return NextResponse.json(
        {
          error: 'Event is full',
          details: `This event has reached maximum capacity (${event.max_capacity} attendees)`
        },
        { status: 400 }
      );
    }

    // [STEP 7] Insert registration
    // DB will enforce UNIQUE(event_id, attendee_email) constraint
    // Trigger will auto-increment current_registrations
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        attendee_name,
        attendee_email,
        whatsapp_number: validationResult.data.whatsapp_number
      })
      .select()
      .single();

    if (registrationError) {
      // Check if duplicate registration (unique constraint violation)
      if (registrationError.code === '23505') {
        return NextResponse.json(
          {
            error: 'Already registered',
            details: 'This email is already registered for this event'
          },
          { status: 409 }
        );
      }

      console.error('Registration error:', registrationError);
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      );
    }

    // [STEP 8] Return success with meeting link (if online/hybrid)
    // Meeting link is revealed ONLY after successful registration
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      registration: {
        id: registration.id,
        attendee_name: registration.attendee_name,
        attendee_email: registration.attendee_email,
        whatsapp_number: registration.whatsapp_number,
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
        // Reveal meeting link ONLY after registration
        meeting_link: event.location_type === 'online' || event.location_type === 'hybrid'
          ? event.meeting_link
          : null
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
