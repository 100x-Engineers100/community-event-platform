import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Event } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Query params: type (upcoming/past), location_type (online/offline/hybrid)
    const type = searchParams.get('type') || 'upcoming'
    const locationType = searchParams.get('location_type')

    let query = supabase
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
        created_at,
        event_image_url,
        host:profiles!host_id(is_admin, cohort)
      `)
      .in('status', ['published', 'completed'])

    // Filter by date
    if (type === 'upcoming') {
      query = query.gt('event_date', new Date().toISOString())
      query = query.order('event_date', { ascending: true })
    } else {
      query = query.lt('event_date', new Date().toISOString())
      query = query.order('event_date', { ascending: false })
    }

    // Filter by location type if provided
    if (locationType && ['online', 'offline', 'hybrid'].includes(locationType)) {
      query = query.eq('location_type', locationType)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // IMPORTANT: meeting_link is excluded from SELECT to maintain privacy
    // Only registered users see meeting links

    const formattedEvents = (events || []).map((e: any) => ({
      ...e,
      host: Array.isArray(e.host) ? e.host[0] : e.host
    }))

    return NextResponse.json({
      events: formattedEvents as unknown as Event[],
      type,
      location_type: locationType
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
