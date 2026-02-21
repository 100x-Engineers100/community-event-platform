import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { sendConfirmationEmail } from '@/lib/email/send-confirmation'

/**
 * POST /api/events/[id]/verify-payment
 *
 * Called by the client after Razorpay checkout handler fires.
 * Verifies HMAC signature, marks registration as paid, sends confirmation email.
 *
 * This is the redirect-based verification path.
 * The webhook (/api/webhooks/razorpay) handles cases where user closes tab.
 * Both are idempotent - safe to run twice.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params // unused but required for Next.js 15 dynamic routes

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 })
    }

    // [STEP 1] Verify HMAC signature
    // Formula: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.error('[VERIFY-PAYMENT] Signature mismatch - possible tamper attempt')
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // [STEP 2] Idempotent update - only updates if not already paid
    // Handles race condition with webhook
    const { data: updated } = await supabase
      .from('registrations')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .neq('payment_status', 'paid')
      .select('id, event_id, attendee_name, attendee_email, whatsapp_number')
      .single()

    // [STEP 3] Always fetch the registration (even if already paid by webhook)
    const { data: registration } = await supabase
      .from('registrations')
      .select('id, event_id, attendee_name, attendee_email, whatsapp_number')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // [STEP 4] Send confirmation email only if WE made the update (not webhook)
    if (updated) {
      const { data: event } = await supabase
        .from('events')
        .select('title, event_date, location_type, city, venue_address, meeting_link, price')
        .eq('id', registration.event_id)
        .single()

      if (event) {
        await sendConfirmationEmail({
          attendee_name: registration.attendee_name,
          attendee_email: registration.attendee_email,
          event_title: event.title,
          event_date: event.event_date,
          location_type: event.location_type,
          city: event.city,
          venue_address: event.venue_address,
          meeting_link: event.meeting_link,
          registration_id: registration.id,
          razorpay_payment_id,
          price: event.price,
        })
      }
    }

    return NextResponse.json({
      success: true,
      registration_id: registration.id,
      event_id: registration.event_id,
    })
  } catch (error) {
    console.error('[VERIFY-PAYMENT] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
