'use client'

import { useState, useEffect } from 'react'
import { PublicNavbar } from '@/components/PublicNavbar'
import { PublicEventCard } from '@/components/PublicEventCard'
import { GlassMorphCard } from '@/components/GlassMorphCard'
import { WatermarkRemover } from '@/components/WatermarkRemover'
import { Button } from '@/components/ui/button'
import { Event, LocationType } from '@/lib/types'
import { Loader2, Calendar, Sparkles } from 'lucide-react'

// TypeScript declaration for Unicorn.Studio
declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean
      init: () => void
    }
  }
}

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming')
  const [locationFilter, setLocationFilter] = useState<LocationType | 'all'>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  // Load Unicorn.Studio script
  useEffect(() => {
    if (!window.UnicornStudio) {
      window.UnicornStudio = {
        isInitialized: false,
        init: () => { }
      }
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.2/dist/unicornStudio.umd.js'
      script.onload = () => {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init()
          window.UnicornStudio.isInitialized = true
        }
      }
      (document.head || document.body).appendChild(script)
    }
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // Fetch upcoming events
      const upcomingRes = await fetch('/api/events?type=upcoming')
      if (!upcomingRes.ok) throw new Error('Failed to fetch upcoming events')
      const upcomingData = await upcomingRes.json()

      // Fetch past events
      const pastRes = await fetch('/api/events?type=past')
      if (!pastRes.ok) throw new Error('Failed to fetch past events')
      const pastData = await pastRes.json()

      setUpcomingEvents(upcomingData.events || [])
      setPastEvents(pastData.events || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const currentEvents = viewMode === 'upcoming' ? upcomingEvents : pastEvents

  const filteredEvents = locationFilter === 'all'
    ? currentEvents
    : currentEvents.filter(e => e.location_type === locationFilter)

  return (
    <>
      <WatermarkRemover />
      {/* Public Navbar */}
      <PublicNavbar />

      <main className="min-h-screen bg-100x-bg-primary">
        {/* Hero Section - 100vh */}
        <section className="relative h-screen overflow-hidden border-b border-100x-border-default bg-gradient-to-b from-100x-bg-secondary to-100x-bg-primary">
          {/* UNICORN.STUDIO INTERACTIVE BACKGROUND - 100x moving background */}
          <div
            id="unicorn-background-container"
            className="absolute inset-0 z-0 unicorn-studio-wrapper"
            aria-hidden="true"
          >
            {/* Unicorn.Studio Project - 100% width and height */}
            <div
              data-us-project="JFzgaAA1LaeIDhGFql0Y"
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Fallback gradient overlay while Unicorn.Studio loads */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,104,70,0.15),transparent_50%)] pointer-events-none" />
          </div>

          {/* Hero Content - Positioned above background */}
          <div className="relative z-10 flex items-center justify-center h-full glass-perspective-container">
            {/* 3D Glass Card - Behind text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <GlassMorphCard />
            </div>

            {/* Hero Text - In front of glass card */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pointer-events-none">


              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-100x-text-primary tracking-tight pointer-events-none">
                100xEngineers
                <span className="block text-100x-accent-primary mt-3">
                  Community Events
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-100x-text-secondary leading-relaxed pointer-events-none">
                Connect, learn, and grow with fellow engineers. Discover workshops,
                meetups, and networking events happening in the community.
              </p>




            </div>
          </div>

          {/* Motto Badge / Watermark Cover - Fixed at bottom of hero section */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[100] px-2 py-1.5 bg-[#0F0F0F] border border-[#F96846] rounded-xl shadow-lg pointer-events-auto flex items-center justify-center whitespace-nowrap transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,104,70,0.6)] hover:scale-105 group cursor-default">
            <span className="text-white font-space-grotesk font-medium text-lg tracking-wide">
              Learn, Evolve, Transform
            </span>
          </div>
        </section>

        {/* Filters & Events Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* View Mode Toggle (Upcoming / Past) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setViewMode('upcoming')}
                className={
                  viewMode === 'upcoming'
                    ? 'bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white'
                    : 'border-100x-border-default text-100x-text-secondary hover:border-100x-accent-primary hover:text-100x-accent-light'
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming Events
                <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  {upcomingEvents.length}
                </span>
              </Button>

              <Button
                variant={viewMode === 'past' ? 'default' : 'outline'}
                onClick={() => setViewMode('past')}
                className={
                  viewMode === 'past'
                    ? 'bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white'
                    : 'border-100x-border-default text-100x-text-secondary hover:border-100x-accent-primary hover:text-100x-accent-light'
                }
              >
                Past Events
                <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  {pastEvents.length}
                </span>
              </Button>
            </div>

            {/* Location Filter */}
            <div className="flex gap-2">
              <span className="text-sm text-100x-text-muted self-center mr-2">Filter:</span>
              {(['all', 'online', 'offline', 'hybrid'] as const).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => setLocationFilter(type)}
                  className={
                    locationFilter === type
                      ? 'bg-100x-accent-primary/10 border-100x-accent-primary text-100x-accent-light'
                      : 'border-100x-border-default text-100x-text-secondary hover:border-100x-accent-primary hover:text-100x-accent-light'
                  }
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-100x-accent-primary animate-spin" />
              <span className="ml-3 text-100x-text-secondary">Loading events...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-lg bg-red-900/20 border border-red-900/40">
                <span className="text-red-200">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEvents}
                  className="border-red-900/40 text-red-200 hover:bg-red-900/30"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <>
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <PublicEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="inline-flex flex-col items-center gap-4 px-8 py-12 rounded-xl bg-100x-bg-tertiary border border-100x-border-default">
                    <Calendar className="w-12 h-12 text-100x-text-muted" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-100x-text-primary">
                        No events found
                      </h3>
                      <p className="text-100x-text-secondary max-w-md">
                        {locationFilter !== 'all'
                          ? `No ${locationFilter} events available ${viewMode === 'upcoming' ? 'right now' : 'in the past'}.`
                          : `No ${viewMode} events available right now. Check back soon!`}
                      </p>
                    </div>
                    {locationFilter !== 'all' && (
                      <Button
                        variant="outline"
                        onClick={() => setLocationFilter('all')}
                        className="border-100x-accent-primary text-100x-accent-light hover:bg-100x-accent-primary/10"
                      >
                        View all events
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  )
}
