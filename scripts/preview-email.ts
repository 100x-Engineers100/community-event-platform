import fs from 'fs'
import path from 'path'

// Mock the escapeHtml function
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

// Interface for the data
interface ConfirmationEmailData {
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

function buildLocationSection(data: ConfirmationEmailData): string {
    if (data.location_type === 'online') return 'Online Event'
    if (data.location_type === 'offline') {
        return [data.city, data.venue_address].filter(Boolean).join(', ')
    }
    return `Hybrid - ${data.city || 'In-Person + Online'}`
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

    const locationSection = buildLocationSection(data)

    // NEW DESIGN STARTS HERE
    const primaryColor = '#FF6B35'
    const bgColor = '#0A0A0A'
    const cardBg = '#141414'
    const borderColor = '#2A2A2A'
    const textPrimary = '#FFFFFF'
    const textSecondary = '#A0A0A0'

    const meetingLinkSection = data.meeting_link
        ? `
      <div style="background:#1a1a1a;border:1px solid ${primaryColor};border-radius:16px;padding:24px;margin:24px 0;">
        <p style="color:${primaryColor};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px 0;">Joining Link</p>
        <a href="${data.meeting_link}" style="color:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:14px;word-break:break-all;text-decoration:none;border-bottom: 1px solid ${primaryColor};">${data.meeting_link}</a>
        <p style="color:#666;font-size:12px;margin:12px 0 0 0;">Click the link above to join the digital session.</p>
      </div>
    `
        : ''

    const venueSection = (data.location_type === 'offline' || data.location_type === 'hybrid') && data.venue_address
        ? (() => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue_address + (data.city ? ', ' + data.city : ''))}`
            return `
          <div style="background:#1a1a1a;border:1px solid ${borderColor};border-radius:16px;padding:24px;margin:24px 0;">
            <p style="color:${primaryColor};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px 0;">Venue Address</p>
            <p style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 6px 0;">${escapeHtml(data.city || '')}</p>
            <p style="color:#aaa;font-size:14px;margin:0 0 16px 0;line-height:1.5;">${escapeHtml(data.venue_address)}</p>
            <a href="${mapsUrl}" style="display:inline-block;background:${primaryColor};color:#000000;font-size:13px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
              Open in Google Maps
            </a>
          </div>
        `
        })()
        : ''

    return \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <title>Confirmed: \${data.event_title}</title>
  <style>
    body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .ticket-content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:\${bgColor};-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:\${bgColor};">
    <tr>
      <td align="center" style="padding:40px 10px;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:\${primaryColor};padding:10px 20px;border-radius:12px;">
                    <span style="color:#000000;font-weight:800;font-size:24px;letter-spacing:-0.05em;line-height:1;">100x</span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;color:#555;font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;">Engineers Community</div>
            </td>
          </tr>

          <!-- Main Hero Section -->
          <tr>
            <td align="center" style="padding-bottom:48px;">
               <div style="display:inline-block;margin-bottom:24px;position:relative;">
                 <div style="width:80px;height:80px;background:rgba(255, 107, 53, 0.1);border:1px solid \${primaryColor};border-radius:50%;display:flex;align-items:center;justify-content:center;">
                   <span style="color:\${primaryColor};font-size:40px;">✓</span>
                 </div>
               </div>
               <h1 style="color:#ffffff;font-size:42px;font-weight:700;margin:0 0 12px 0;letter-spacing:-0.04em;line-height:1.1;">You're In!</h1>
               <p style="color:#888;font-size:18px;margin:0;font-weight:400;">Your spot is secured. Ready to level up?</p>
            </td>
          </tr>

          <!-- Digital Ticket -->
          <tr>
            <td style="position:relative;">
              <div style="background:\${cardBg};border:1px solid \${borderColor};border-radius:32px;overflow:hidden;box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                
                <!-- Ticket Header -->
                <div style="padding:40px;background:linear-gradient(135deg, \${cardBg} 0%, #1a1a1a 100%);border-bottom: 2px dashed \${borderColor};position:relative;">
                  <!-- Corner notches (optional, simulated) -->
                  <div style="padding-bottom:12px;">
                    <span style="color:\${primaryColor};font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">Confirmed Registration</span>
                  </div>
                  <h2 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;letter-spacing:-0.02em;line-height:1.2;">\${escapeHtml(data.event_title)}</h2>
                </div>

                <!-- Ticket Details -->
                <div class="ticket-content" style="padding:40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-bottom:32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="50%" valign="top">
                              <p style="color:#666;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px 0;">Date</p>
                              <p style="color:#ffffff;font-size:15px;font-weight:600;margin:0;">\${formattedDate}</p>
                            </td>
                            <td width="50%" valign="top">
                              <p style="color:#666;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px 0;">Time</p>
                              <p style="color:#ffffff;font-size:15px;font-weight:600;margin:0;">\${formattedTime} IST</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:32px;">
                        <p style="color:#666;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px 0;">Location</p>
                        <p style="color:#ffffff;font-size:15px;font-weight:600;margin:0;">\${locationSection}</p>
                      </td>
                    </tr>

                    \${meetingLinkSection || venueSection ? \`<tr><td>\${meetingLinkSection}\${venueSection}</td></tr>\` : ''}

                    <tr>
                      <td style="padding-top:24px;border-top:1px solid \${borderColor};">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td valign="bottom" style="padding-right:20px;">
                              <p style="color:#666;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px 0;">Attendee</p>
                              <p style="color:#ffffff;font-size:16px;font-weight:600;margin:0;">\${escapeHtml(data.attendee_name)}</p>
                              <p style="color:#888;font-size:13px;margin:4px 0 0 0;">\${escapeHtml(data.attendee_email)}</p>
                            </td>
                            <td align="right" valign="bottom">
                              <p style="color:#666;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px 0;">Paid</p>
                              <p style="color:\${primaryColor};font-size:24px;font-weight:800;font-family:'Space Grotesk', sans-serif;margin:0;">\${amountDisplay}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Payment Info -->
                <div style="background:#0F0F0F;padding:24px 40px;text-align:center;border-top: 1px solid \${borderColor};">
                   <p style="color:#444;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;letter-spacing:0.05em;margin:0;">
                    REF: \${ticketId} &nbsp;&bull;&nbsp; P_ID: \${data.razorpay_payment_id}
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:48px;">
              <p style="color:#666;font-size:14px;line-height:1.6;margin:0;">
                Questions about the event? <br/>
                Reply here or contact <a href="mailto:community@100xengineers.com" style="color:\${primaryColor};text-decoration:none;font-weight:600;">community@100xengineers.com</a>
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                   <td style="color:#333;font-size:11px;font-weight:500;letter-spacing:0.05em;">
                     &copy; \${new Date().getFullYear()} 100x Engineers. All rights reserved.
                   </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
\`;
}

// Dummy data
const data: ConfirmationEmailData = {
  attendee_name: "Vishal",
  attendee_email: "vishal@example.com",
  event_title: "Mastering Next.js with App Router",
  event_date: new Date().toISOString(),
  location_type: "hybrid",
  city: "Bangalore",
  venue_address: "100x Engineers HQ, Indiranagar, Bangalore",
  meeting_link: "https://zoom.us/j/123456789",
  registration_id: "REG-12345-67890",
  razorpay_payment_id: "pay_XYZ123",
  price: 99900 // 999.00
}

const html = buildEmailHTML(data)
fs.writeFileSync(path.join(process.cwd(), 'preview.html'), html)
console.log("Preview generated at preview.html")
