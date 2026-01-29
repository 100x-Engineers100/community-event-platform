import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: eventId } = await params;

  try {
    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, event_date, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch registrations for this event
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('attendee_name, attendee_email, registered_at')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (regError) {
      console.error('[EXPORT-RSVP] Error fetching registrations:', regError);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ error: 'No registrations found' }, { status: 404 });
    }

    // Get all verified member emails for comparison
    const { data: verifiedMembers, error: vmError } = await supabase
      .from('verified_members')
      .select('email');

    if (vmError) {
      console.error('[EXPORT-RSVP] Error fetching verified members:', vmError);
    }

    const verifiedEmails = new Set(
      verifiedMembers?.map(vm => vm.email.toLowerCase().trim()) || []
    );

    // Categorize registrations
    const communityMembers: typeof registrations = [];
    const newLeads: typeof registrations = [];

    registrations.forEach(reg => {
      const email = reg.attendee_email.toLowerCase().trim();
      if (verifiedEmails.has(email)) {
        communityMembers.push(reg);
      } else {
        newLeads.push(reg);
      }
    });

    // Generate CSV
    const csv = generateCSV(event.title, communityMembers, newLeads);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rsvp-${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv"`,
      },
    });

  } catch (error) {
    console.error('[EXPORT-RSVP] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateCSV(
  eventTitle: string,
  communityMembers: Array<{ attendee_name: string; attendee_email: string; registered_at: string }>,
  newLeads: Array<{ attendee_name: string; attendee_email: string; registered_at: string }>
): string {
  const lines: string[] = [];

  // Header
  lines.push(`Event: ${eventTitle}`);
  lines.push(`Export Date: ${new Date().toISOString()}`);
  lines.push(`Total Registrations: ${communityMembers.length + newLeads.length}`);
  lines.push('');

  // Community Members Section
  lines.push('=== COMMUNITY MEMBERS ===');
  lines.push(`Total: ${communityMembers.length}`);
  lines.push('Name,Email,Registered At');

  communityMembers.forEach(member => {
    const name = escapeCSV(member.attendee_name);
    const email = escapeCSV(member.attendee_email);
    const date = new Date(member.registered_at).toISOString();
    lines.push(`${name},${email},${date}`);
  });

  lines.push('');
  lines.push('');

  // New Leads Section
  lines.push('=== NEW LEADS ===');
  lines.push(`Total: ${newLeads.length}`);
  lines.push('Name,Email,Registered At');

  newLeads.forEach(lead => {
    const name = escapeCSV(lead.attendee_name);
    const email = escapeCSV(lead.attendee_email);
    const date = new Date(lead.registered_at).toISOString();
    lines.push(`${name},${email},${date}`);
  });

  return lines.join('\n');
}

function escapeCSV(value: string): string {
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
