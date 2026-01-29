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

  // Get host ID from params
  const { id: hostId } = await params;

  console.log('[VERIFY-HOST] Checking host:', hostId);

  // Call verification function
  const { data, error } = await supabase.rpc('verify_host', {
    host_id: hostId
  });

  if (error) {
    console.error('[VERIFY-HOST] RPC Error:', error);
    return NextResponse.json({
      error: 'Verification failed',
      details: error.message
    }, { status: 500 });
  }

  console.log('[VERIFY-HOST] RPC Response:', data);

  // Return verification result
  const result = data?.[0] || { is_verified: false, matched_cohort: null, matched_by: null };

  console.log('[VERIFY-HOST] Returning:', result);

  return NextResponse.json({
    is_verified: result.is_verified,
    cohort: result.matched_cohort,
    matched_by: result.matched_by
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
