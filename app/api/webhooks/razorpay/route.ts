import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { sendConfirmationEmail } from '@/lib/email/send-confirmation'

/**
 * POST /api/webhooks/razorpay
 *
 * Receives Razorpay webhook events.
 * Handles cases where user closes tab before verify-payment fires.
 *
 * Setup in Razorpay Dashboard:
 *   Webhook URL: https://events.100xengineers.com/api/webhooks/razorpay
 *   Events to subscribe: payment.captured, payment.failed
 *   Secret: set RAZORPAY_WEBHOOK_SECRET env var to match
 *
 * Note: Uses RAZORPAY_WEBHOOK_SECRET (different from RAZORPAY_KEY_SECRET)
 */
export async function POST(request: NextRequest) {
  let rawBody: string

  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'Cannot read body' }, { status: 400 })
  }

  // [STEP 1] Verify webhook signature using WEBHOOK_SECRET
  const signature = request.headers.get('x-razorpay-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  if (expectedSignature !== signature) {
    console.error('[WEBHOOK] Signature mismatch - rejecting request')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // [STEP 2] Parse event
  let event: { event: string; payload: { payment: { entity: Record<string, unknown> } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // [STEP 3] Handle payment.captured
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const orderId = payment.order_id as string
    const paymentId = payment.id as string

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Missing order_id or payment id' }, { status: 400 })
    }

    // Idempotent update - same guard as verify-payment
    const { data: updated } = await supabase
      .from('registrations')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: paymentId,
      })
      .eq('razorpay_order_id', orderId)
      .neq('payment_status', 'paid')
      .select('id, event_id, attendee_name, attendee_email, whatsapp_number')
      .single()

    if (updated) {
      const { data: eventData } = await supabase
        .from('events')
        .select('title, event_date, location_type, city, venue_address, meeting_link, price')
        .eq('id', updated.event_id)
        .single()

      if (eventData) {
        await sendConfirmationEmail({
          attendee_name: updated.attendee_name,
          attendee_email: updated.attendee_email,
          event_title: eventData.title,
          event_date: eventData.event_date,
          location_type: eventData.location_type,
          city: eventData.city,
          venue_address: eventData.venue_address,
          meeting_link: eventData.meeting_link,
          registration_id: updated.id,
          razorpay_payment_id: paymentId,
          price: eventData.price,
        })
      }
    }

    return NextResponse.json({ received: true })
  }

  // [STEP 4] Handle payment.failed
  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    const orderId = payment.order_id as string

    if (orderId) {
      await supabase
        .from('registrations')
        .update({ payment_status: 'failed' })
        .eq('razorpay_order_id', orderId)
        .eq('payment_status', 'pending')
    }

    return NextResponse.json({ received: true })
  }

  // Unknown event type - acknowledge to prevent Razorpay retries
  return NextResponse.json({ received: true })
}
