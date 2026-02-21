import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import razorpay from '@/lib/razorpay'
import { registrationDBSchema } from '@/lib/validations/registration'

/**
 * POST /api/events/[id]/create-order
 *
 * Creates a Razorpay order server-side and inserts a pending registration.
 * Client then opens the Razorpay checkout modal with the returned order_id.
 *
 * Security:
 * - Amount comes from the DB, never from the client
 * - Pending registrations do not count toward capacity
 * - Duplicate pending orders for same email are replaced
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    // [STEP 1] Validate attendee fields
    const validation = registrationDBSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid registration data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { attendee_name, attendee_email, whatsapp_number } = validation.data

    const supabase = createAdminClient()

    // [STEP 2] Fetch event - get price from DB, never trust client
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, price, status, event_date, max_capacity, current_registrations')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event is not available for registration' }, { status: 400 })
    }

    if (new Date(event.event_date) <= new Date()) {
      return NextResponse.json({ error: 'Cannot register for past events' }, { status: 400 })
    }

    // [STEP 3] Capacity check (only paid/free count toward capacity)
    if (event.current_registrations >= event.max_capacity) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 })
    }

    // [STEP 4] Check for existing paid registration (no double payment)
    const { data: existingPaid } = await supabase
      .from('registrations')
      .select('id, payment_status')
      .eq('event_id', eventId)
      .eq('attendee_email', attendee_email.toLowerCase())
      .in('payment_status', ['paid', 'free'])
      .maybeSingle()

    if (existingPaid) {
      return NextResponse.json(
        { error: 'Already registered', details: 'This email is already registered for this event' },
        { status: 409 }
      )
    }

    // [STEP 5] Clean up any existing pending/failed order for this email+event
    // Allows safe retries after modal close
    await supabase
      .from('registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('attendee_email', attendee_email.toLowerCase())
      .in('payment_status', ['pending', 'failed'])

    // [STEP 6] Create Razorpay order server-side
    // Amount is sourced from DB - client cannot manipulate this
    const order = await razorpay.orders.create({
      amount: event.price,
      currency: 'INR',
      receipt: `evt_${eventId.split('-')[0]}_${Date.now()}`.slice(0, 40),
    })

    // [STEP 7] Insert pending registration tied to this order
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        attendee_name,
        attendee_email: attendee_email.toLowerCase(),
        whatsapp_number: whatsapp_number || null,
        razorpay_order_id: order.id,
        payment_status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[CREATE-ORDER] Insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      event_title: event.title,
      registration_id: registration.id,
    })
  } catch (error) {
    console.error('[CREATE-ORDER] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
