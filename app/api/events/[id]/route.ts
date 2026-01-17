import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Event } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Fetch event by ID
    // Only return published or completed events (public access)
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        host_id,
        title,
        description,
        event_date,
        location_type,
        city,
        venue_address,
        max_capacity,
        current_registrations,
        status,
        created_at
      `)
      .eq('id', id)
      .in('status', ['published', 'completed'])
      .single()

    if (error || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // IMPORTANT: meeting_link is NOT included in SELECT
    // It will be revealed after registration in Stage 5

    return NextResponse.json({ event: event as Event })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
