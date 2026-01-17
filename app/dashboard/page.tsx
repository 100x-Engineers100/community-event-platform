import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button'
import { SplineScene } from "@/components/ui/splite"
import { Spotlight } from "@/components/ui/spotlight"
import { MouseSpotlight } from "@/components/ui/mouse-spotlight"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Profile, Event } from '@/lib/types'

async function getDashboardData() {
  const supabase = await createClient()

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  // Fetch events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Check submission limit
  const { data: canSubmitData } = await supabase.rpc('can_submit_event', {
    user_id: user.id
  })

  // Get current submission count (active events)
  const { data: submissionCount } = await supabase.rpc('get_today_active_event_count', {
    user_id: user.id
  })

  const currentCount = (submissionCount as number) || 0

  return {
    profile: profile as Profile,
    events: (events || []) as Event[],
    canSubmit: canSubmitData as boolean,
    currentCount,
    maxLimit: 3
  }
}

export default async function DashboardPage() {
  const { profile, events, canSubmit, currentCount, maxLimit } = await getDashboardData()

  const hasExpiredEvents = events.some(e => e.status === 'expired')
  const hasEvents = events.length > 0

  return (
    <div className="min-h-screen bg-100x-bg-primary">
      <Navigation user={profile} />

      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Hero Section */}
        <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden mb-8 border-100x-border-default group">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          <MouseSpotlight size={300} />

          <div className="flex flex-col md:flex-row h-full">
            {/* Left content */}
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                My Events
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg">
                Manage your event submissions and track their status.
                Bring your community together with immersive experiences.
              </p>
            </div>

            {/* Right content */}
            <div className="flex-1 relative min-h-[300px] md:min-h-full">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>

        {/* Submission Limit Alert */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Alert className="flex-1 bg-100x-bg-secondary border-100x-border-default">
            <AlertDescription className="text-100x-text-secondary">
              <span className="text-100x-accent-primary font-semibold">
                {currentCount}/{maxLimit}
              </span>{' '}
              submissions today
              {!canSubmit && ' - Limit reached. Try again tomorrow.'}
            </AlertDescription>
          </Alert>

          <Link href="/create-event">
            <Button
              disabled={!canSubmit}
              className="bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Expired Events Banner */}
        {hasExpiredEvents && (
          <Alert className="mb-6 bg-100x-accent-primary/10 border-100x-accent-primary">
            <AlertDescription className="text-100x-text-primary">
              Some of your events expired without review. You can resubmit them as new events.
            </AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {hasEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-100x-bg-secondary rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-100x-text-muted" />
            </div>
            <h2 className="text-2xl font-semibold text-100x-text-primary mb-2">
              No events yet
            </h2>
            <p className="text-100x-text-secondary mb-6 max-w-md">
              Create your first community event and share it with the 100x Engineers community.
            </p>
            <Link href="/create-event">
              <Button
                disabled={!canSubmit}
                className="bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
