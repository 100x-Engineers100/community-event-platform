import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test 1: Check if we can connect
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (tablesError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          details: tablesError.message,
        },
        { status: 500 }
      )
    }

    // Test 2: Check all tables exist
    const testResults = {
      profiles: false,
      events: false,
      daily_submissions: false,
      registrations: false,
    }

    const profilesTest = await supabase.from('profiles').select('count').limit(1)
    testResults.profiles = !profilesTest.error

    const eventsTest = await supabase.from('events').select('count').limit(1)
    testResults.events = !eventsTest.error

    const dailyTest = await supabase.from('daily_submissions').select('count').limit(1)
    testResults.daily_submissions = !dailyTest.error

    const regsTest = await supabase.from('registrations').select('count').limit(1)
    testResults.registrations = !regsTest.error

    const allTablesExist = Object.values(testResults).every((result) => result === true)

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist
        ? '[OK] Database connected successfully. All tables exist.'
        : '[ERROR] Some tables are missing',
      tables: testResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '[ERROR] Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
