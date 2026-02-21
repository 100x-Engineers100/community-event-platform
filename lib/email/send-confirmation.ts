import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface ConfirmationEmailData {
  attendee_name: string
  attendee_email: string
  event_title: string
  event_date: string
  location_type: string
  city: string | null
  venue_address: string | null
  meeting_link: string | null
  registration_id: string
  razorpay_payment_id: string
  price: number // in paise
}

export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: '100xEngineers <community@100xbuilders.com>',
      to: data.attendee_email,
      subject: `Confirmed: ${data.event_title}`,
      html: buildEmailHTML(data),
    })

    if (error) {
      console.error('[EMAIL] Resend error:', error)
    }
  } catch (err) {
    console.error('[EMAIL] Unexpected error:', err)
  }
}

function buildEmailHTML(data: ConfirmationEmailData): string {
  const eventDate = new Date(data.event_date)
  const formattedDate = eventDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const formattedTime = eventDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })

  const amountDisplay = `Rs. ${(data.price / 100).toLocaleString('en-IN')}`
  const ticketId = data.registration_id.split('-')[0].toUpperCase()

  // Brand palette
  const CORAL = '#F96846'
  const PAGE_BG = '#F0EFE9'   // warm off-white — feels premium, not sterile
  const CARD_BG = '#FFFFFF'
  const RULE = '#E8E8E4'
  const TEXT_DARK = '#111111'
  const TEXT_MID = '#555555'
  const TEXT_LIGHT = '#999999'

  const locationLabel = data.location_type === 'online'
    ? 'Online'
    : data.location_type === 'offline'
      ? (data.city || 'In-Person')
      : `Hybrid — ${data.city || 'In-Person + Online'}`

  // Meeting link block (online / hybrid)
  const meetingBlock = data.meeting_link ? `
    <tr>
      <td style="padding:20px 32px;border-bottom:1px solid ${RULE};">
        <p style="margin:0 0 6px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Join Link</p>
        <a href="${data.meeting_link}"
           style="color:${CORAL};font-family:'Courier New',Courier,monospace;font-size:13px;word-break:break-all;text-decoration:none;font-weight:600;">
          ${data.meeting_link}
        </a>
      </td>
    </tr>
  ` : ''

  // Venue block (offline / hybrid)
  const venueBlock = (data.location_type === 'offline' || data.location_type === 'hybrid') && data.venue_address
    ? (() => {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        data.venue_address + (data.city ? ', ' + data.city : '')
      )}`
      return `
          <tr>
            <td style="padding:20px 32px;border-bottom:1px solid ${RULE};">
              <p style="margin:0 0 6px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Venue</p>
              <p style="margin:0 0 2px 0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">${escapeHtml(data.city || '')}</p>
              <p style="margin:0 0 12px 0;color:${TEXT_MID};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;">${escapeHtml(data.venue_address)}</p>
              <a href="${mapsUrl}"
                 style="display:inline-block;border:1.5px solid ${CORAL};color:${CORAL};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;padding:7px 16px;border-radius:6px;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
                Open in Maps
              </a>
            </td>
          </tr>
        `
    })()
    : ''

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if !mso]><!-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" />
  <!--<![endif]-->
  <title>Confirmed: ${escapeHtml(data.event_title)}</title>
  <style type="text/css">
    body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    @media only screen and (max-width:600px) {
      .email-wrapper  { width:100% !important; }
      .card-cell      { padding:0 16px !important; }
      .inner-pad      { padding:20px 20px !important; }
      .col-half       { display:block !important; width:100% !important; padding-bottom:16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background-color:${PAGE_BG};font-family:Roboto,Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:48px 16px 56px 16px;">

      <table class="email-wrapper" width="540" cellpadding="0" cellspacing="0" border="0"
             style="width:540px;max-width:540px;">

        <!-- ─── LOGO ─── -->
        <tr>
          <td align="center" style="padding-bottom:36px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${CORAL};border-radius:8px;padding:5px 13px;">
                  <span style="color:#ffffff;font-family:Roboto,Arial,Helvetica,sans-serif;font-size:16px;font-weight:900;letter-spacing:-0.03em;">100x</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="color:${TEXT_MID};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:16px;font-weight:500;letter-spacing:0.04em;">Engineers</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ─── CHECK + HEADLINE ─── -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <!-- Circle check -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td align="center" style="width:56px;height:56px;border-radius:50%;border:2px solid ${CORAL};background-color:#FFF3EF;">
                  <span style="color:${CORAL};font-size:26px;font-weight:900;line-height:56px;font-family:Arial,sans-serif;">&#10003;</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 8px 0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:32px;font-weight:900;letter-spacing:-0.03em;line-height:1;">
              Registration Confirmed
            </h1>
            <p style="margin:0;color:${TEXT_MID};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:15px;font-weight:400;">
              Your spot is locked in. See you there.
            </p>
          </td>
        </tr>

        <!-- ─── MAIN CARD ─── -->
        <tr>
          <td class="card-cell">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:${CARD_BG};border:1px solid ${RULE};border-radius:16px;overflow:hidden;">

              <!-- Event header -->
              <tr>
                <td class="inner-pad" style="padding:28px 32px;border-bottom:1px solid ${RULE};">
                  <p style="margin:0 0 8px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Event</p>
                  <h2 style="margin:0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;line-height:1.3;letter-spacing:-0.01em;">
                    ${escapeHtml(data.event_title)}
                  </h2>
                </td>
              </tr>

              <!-- Date / Time / Location -->
              <tr>
                <td class="inner-pad" style="padding:24px 32px;border-bottom:1px solid ${RULE};">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="col-half" width="40%" valign="top" style="padding-right:12px;padding-bottom:0;">
                        <p style="margin:0 0 5px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Date</p>
                        <p style="margin:0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;line-height:1.4;">${formattedDate}</p>
                      </td>
                      <td class="col-half" width="20%" valign="top" style="padding-right:12px;padding-bottom:0;">
                        <p style="margin:0 0 5px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Time</p>
                        <p style="margin:0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;">${formattedTime} IST</p>
                      </td>
                      <td class="col-half" width="40%" valign="top" style="padding-bottom:0;">
                        <p style="margin:0 0 5px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Location</p>
                        <p style="margin:0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;">${escapeHtml(locationLabel)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Join link (conditional) -->
              ${meetingBlock}

              <!-- Venue (conditional) -->
              ${venueBlock}

              <!-- Attendee row -->
              <tr>
                <td class="inner-pad" style="padding:24px 32px;border-bottom:1px solid ${RULE};">
                  <p style="margin:0 0 5px 0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Attendee</p>
                  <p style="margin:0 0 2px 0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">${escapeHtml(data.attendee_name)}</p>
                  <p style="margin:0;color:${TEXT_MID};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:13px;">${escapeHtml(data.attendee_email)}</p>
                </td>
              </tr>

              <!-- Amount row -->
              <tr>
                <td class="inner-pad" style="padding:24px 32px;border-bottom:1px solid ${RULE};">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <p style="margin:0;color:${TEXT_MID};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:14px;">Registration fee</p>
                      </td>
                      <td align="right">
                        <p style="margin:0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;">${amountDisplay}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:12px;border-top:1px solid ${RULE};">
                        <p style="margin:8px 0 0 0;color:${TEXT_DARK};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Total Paid</p>
                      </td>
                      <td align="right" style="padding-top:12px;border-top:1px solid ${RULE};">
                        <p style="margin:8px 0 0 0;color:${CORAL};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:20px;font-weight:900;letter-spacing:-0.02em;">${amountDisplay}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Reference / ticket ID -->
              <tr>
                <td style="padding:14px 32px;background-color:#FAFAF8;">
                  <p style="margin:0;color:${TEXT_LIGHT};font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.08em;text-align:center;">
                    REF&nbsp;${ticketId}&nbsp;&nbsp;|&nbsp;&nbsp;${data.razorpay_payment_id}
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- ─── FOOTER ─── -->
        <tr>
          <td align="center" style="padding-top:36px;">
            <p style="margin:0 0 4px 0;color:${TEXT_MID};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:13px;">
              Questions? <a href="mailto:community@100xengineers.com"
                            style="color:${CORAL};text-decoration:none;font-weight:600;">community@100xengineers.com</a>
            </p>
            <p style="margin:0;color:${TEXT_LIGHT};font-family:Roboto,Arial,Helvetica,sans-serif;font-size:11px;">
              &copy; ${new Date().getFullYear()} 100x Engineers. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
