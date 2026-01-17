import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call Supabase function to check submission limit
    const { data, error } = await supabase.rpc('can_submit_event', {
      user_id: user.id
    })

    if (error) {
      console.error('Error checking submission limit:', error)
      return NextResponse.json(
        { error: 'Failed to check submission limit' },
        { status: 500 }
      )
    }

    // Get current count for today using RPC (counts active events)
    const { data: submissionCount, error: countError } = await supabase.rpc('get_today_active_event_count', {
      user_id: user.id
    })

    // Default to 0 if there's an error or no data (though RPC returns int)
    const currentCount = (submissionCount as number) || 0

    return NextResponse.json({
      canSubmit: data as boolean,
      currentCount,
      maxLimit: 3
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
