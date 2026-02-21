import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Event } from '@/lib/types'
import { eventFormSchema } from '@/lib/validations/event'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's events, ordered by created_at desc
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({ events: events as Event[] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate with Zod
    const validation = eventFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const eventData = validation.data

    // Check if user is admin (admins skip daily limit)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin === true

    // Check daily submission limit (non-admins only)
    if (!isAdmin) {
      const { data: canSubmitData, error: canSubmitError } = await supabase.rpc(
        'can_submit_event',
        { user_id: user.id }
      )

      if (canSubmitError) {
        console.error('Error checking submission limit:', canSubmitError)
        return NextResponse.json(
          { error: 'Failed to check submission limit' },
          { status: 500 }
        )
      }

      if (!canSubmitData) {
        return NextResponse.json(
          { error: 'Daily submission limit reached (3/day)' },
          { status: 429 }
        )
      }
    }

    // Check title uniqueness
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('title', eventData.title)
      .single()

    if (existingEvent) {
      return NextResponse.json(
        { error: 'An event with this title already exists' },
        { status: 409 }
      )
    }

    // Create event
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        host_id: user.id,
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        location_type: eventData.location_type,
        city: eventData.city || null,
        meeting_link: eventData.meeting_link || null,
        venue_address: eventData.venue_address || null,
        max_capacity: eventData.max_capacity,
        event_image_url: eventData.event_image_url || '/images/default-event-image.png',
        // Only admins can set a price
        price: isAdmin ? (eventData.price || 0) : 0,
        status: 'submitted'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating event:', insertError)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    // Increment daily submission count
    const { error: incrementError } = await supabase.rpc(
      'increment_daily_count',
      { user_id: user.id }
    )

    if (incrementError) {
      console.error('Error incrementing daily count:', incrementError)
      // Event created, but count not incremented - log but don't fail
    }

    return NextResponse.json({
      success: true,
      event: newEvent as Event
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
