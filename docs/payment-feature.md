# Payment & Email Feature - Implementation Report

## Overview
Razorpay payment integration + Resend confirmation email for paid events on the 100x Engineers community events platform.

---

## What was built

### Database (sql/09_payment_fields.sql)
- `events.price` — integer, paise, default 0 (0 = free)
- `registrations.razorpay_order_id` — ties registration to Razorpay order
- `registrations.razorpay_payment_id` — set after payment confirmed
- `registrations.payment_status` — enum: free | pending | paid | failed
- Updated `increment_registration_count` trigger — only fires for `payment_status = 'free'`
- New `increment_registration_on_payment` trigger — fires when status changes to `paid`
- Result: `current_registrations` only counts paid + free. Pending orders do not block capacity.

### Payment Flow (3-step, production-safe)
1. `POST /api/events/[id]/create-order` — server creates Razorpay order (amount from DB, never client), inserts `pending` registration
2. Client opens Razorpay modal (checkout.js)
3. `POST /api/events/[id]/verify-payment` — HMAC-SHA256 signature verify, marks `paid`, sends email
4. `POST /api/webhooks/razorpay` — handles tab-close case (payment.captured / payment.failed), idempotent with verify-payment

### Security
- Price sourced from DB server-side only — client cannot manipulate amount
- HMAC verification: `SHA256(order_id + "|" + payment_id, KEY_SECRET)`
- Webhook verification: `SHA256(raw_body, WEBHOOK_SECRET)`
- Free register route (`/api/events/[id]/register`) guards against paid events
- Duplicate payment prevention: unique constraint on (event_id, attendee_email) for paid/free status
- Retry-safe: pending/failed orders for same email+event are deleted before new order creation

### Admin Controls
- Price field visible only when `is_admin = true` on create-event page
- Admin bypasses daily submission limit (3/day)
- "Create Event" button added to admin command center Quick Actions
- Price input: admin enters rupees, stored as paise internally

### Email (Resend)
- Sender: `100xEngineers <community@100xbuilders.com>` (custom verified domain)
- Triggered after payment verified — both from verify-payment and webhook handler
- Idempotency guard: email only sent once (whichever fires first — redirect or webhook)
- Email failure does NOT break payment flow (logged, not thrown)
- For paid offline events: venue address + map link sent in email only (not shown publicly)
- **Root cause fix**: payment routes (create-order, verify-payment, webhook) now use service role client (`lib/supabase/admin.ts`) instead of anon client — anon client has no session in these routes so RLS was silently blocking the DB update, making `updated = null` and skipping the email

### UI
- `components/PaymentForm.tsx` — collects name/email/whatsapp, creates order, opens Razorpay modal, verifies, redirects
- `app/events/[id]/page.tsx` — conditionally renders PaymentForm (price > 0) or RegistrationForm (price = 0)
- Free event flow completely untouched

---

## Environment Variables Required
```
RAZORPAY_KEY_ID              # server only
RAZORPAY_KEY_SECRET          # server only
NEXT_PUBLIC_RAZORPAY_KEY_ID  # client (same value as KEY_ID)
RAZORPAY_WEBHOOK_SECRET      # from Razorpay Dashboard > Webhooks
RESEND_API_KEY               # from resend.com
```

## Razorpay Webhook Setup
```
URL:    https://events.100xengineers.com/api/webhooks/razorpay
Events: payment.captured, payment.failed
```

---

## Known Limitations
- Razorpay test mode UPI QR does not work with real UPI apps (test mode only)
- Custom domain 100xbuilders.com verified on Resend via GoDaddy DNS (SPF + DKIM records)
- No refund flow implemented (manual via Razorpay dashboard)
- Capacity is not hard-locked during pending payment window (acceptable for community scale)
