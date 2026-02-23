import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Profile, Event } from '@/lib/types'
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import ShaderBackground from '@/components/ui/shader-background'

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
    <div className="min-h-screen bg-black selection:bg-100x-accent-primary/30 relative overflow-hidden">
      {/* Orange Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/15 blur-[150px] rounded-full" />
      </div>
      <Navigation user={profile} />

      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl space-y-12 relative z-10">
        {/* Welcome Hero */}
        <section className="relative">
          <Card className="w-full h-[500px] bg-zinc-900 backdrop-blur-3xl relative overflow-hidden border-zinc-800 rounded-[40px] group shadow-2xl">
            {/* Shader Animation Background */}
            <ShaderBackground className="absolute inset-0 opacity-40" />

            {/* Simple Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-100x-accent-primary/10 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-100x-accent-primary/20 via-transparent to-transparent" />

            {/* Animated Glow Effect */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-100x-accent-primary/20 rounded-full blur-3xl animate-pulse" />

            <div className="flex flex-col md:flex-row h-full relative z-10">
              {/* Left content */}
              <div className="max-w-2xl p-10 md:p-16 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-100x-accent-primary/10 border border-100x-accent-primary/20 text-100x-accent-primary text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Host Portal
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                    Your <span className="text-100x-accent-primary italic">events</span>
                  </h1>
                </div>
                <p className="text-zinc-400 font-medium text-lg max-w-md leading-relaxed">
                  Create and manage events for the 100x community.
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/create-event">
                    <ShimmerButton
                      disabled={!canSubmit}
                      shimmerColor="#ffffff"
                      background="#FF6B35"
                      className="h-12 px-5 text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-100x-accent-primary/20 disabled:opacity-50"
                    >
                      Create a community event
                    </ShimmerButton>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Status Dashboard Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Submission Power Bar */}
          <Card className="md:col-span-2 p-8 bg-zinc-900/50 border-zinc-800 rounded-[32px] flex items-center justify-between gap-8 overflow-hidden group">
            <div className="space-y-2 relative z-10">
              <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest">Event submissions</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{currentCount}</span>
                <span className="text-xl font-bold text-zinc-700">of {maxLimit}</span>
                <span className="text-xs font-medium text-zinc-500 ml-2">available today</span>
              </div>
            </div>

            <div className="flex-1 max-w-xs space-y-3 relative z-10">
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                <div
                  className="h-full bg-gradient-to-r from-100x-accent-primary to-orange-400 transition-all duration-1000"
                  style={{ width: `${(currentCount / maxLimit) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Quick Stat (Experimental) */}
          <Card className="p-8 bg-zinc-950/40 border-zinc-800/80 backdrop-blur-2xl rounded-[32px] space-y-2 relative overflow-hidden group cursor-pointer transition-all hover:border-100x-accent-primary/50 hover:shadow-[0_20px_40px_-20px_rgba(255,107,53,0.3)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-100x-accent-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />


            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-100x-accent-primary animate-pulse shadow-[0_0_8px_rgba(255,107,53,1)]" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total registrations</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white group-hover:text-100x-accent-primary transition-colors duration-500">
                {events.reduce((acc, e) => acc + (e.current_registrations || 0), 0)}
              </span>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 transition-colors flex items-center gap-2">
              registrations so far
            </p>
          </Card>
        </div>

        {/* Expired Events Banner */}
        {hasExpiredEvents && (
          <Alert className="bg-100x-accent-primary/10 border-100x-accent-primary/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-100x-accent-primary rounded-xl flex items-center justify-center text-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <AlertDescription className="text-zinc-300 font-medium">
                Wait! Some of your events expired without review. <span className="text-white font-bold underline cursor-pointer">Resubmit them</span> and let's get them published!
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Events Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Your events
              <span className="text-zinc-800 text-lg">/</span>
              <span className="text-zinc-600 font-bold text-lg">{events.length}</span>
            </h2>
          </div>

          {hasEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <DashboardEmptyState canSubmit={canSubmit} />
          )}
        </section>
      </main>

      <footer className="container mx-auto px-4 py-20 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800">
          The 100x Engineers Host Experience
        </p>
      </footer>
    </div>
  )
}
