'use client'

import { useState, useEffect } from 'react'
import { PublicNavbar } from '@/components/PublicNavbar'
import { PublicEventCard } from '@/components/PublicEventCard'
import { WatermarkRemover } from '@/components/WatermarkRemover'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Spotlight } from "@/components/ui/spotlight"
import { SplineScene } from "@/components/ui/splite"
import { Event, LocationType } from '@/lib/types'
import { Loader2, Calendar, Sparkles, MapPin, Globe, Clock, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const upcomingRes = await fetch('/api/events?type=upcoming')
      const pastRes = await fetch('/api/events?type=past')

      const upcomingData = await upcomingRes.json()
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
    <div className="min-h-screen bg-black text-white selection:bg-100x-accent-primary/30 overflow-x-hidden">
      <WatermarkRemover />
      <PublicNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

          <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >


              <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter">
                100x <br />
                <span className="text-zinc-600">Engineers</span> <br />
                <span className="text-100x-accent-primary">Events.</span>
              </h1>

              <p className="text-zinc-400 text-base md:text-lg max-w-md font-medium leading-relaxed">
                Where high-performance engineers meet to share, build, and break things. Join the inner circle.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <ShimmerButton
                  onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
                  shimmerColor="#ffffff"
                  background="#FF6B35"
                  className="h-14 px-8 text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.05]"
                >
                  Explore Events
                </ShimmerButton>
                <Link href="/login">
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    background="#1a1a1a"
                    className="h-14 px-8 border border-zinc-800 text-white font-black text-lg rounded-2xl hover:bg-zinc-900"
                  >
                    Host an Event
                  </ShimmerButton>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="flex gap-12 pt-8 border-t border-zinc-900">
                <div>
                  <p className="text-3xl font-black">{upcomingEvents.length + pastEvents.length}</p>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Events</p>
                </div>
                <div>
                  <p className="text-3xl font-black">500+</p>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Engineers</p>
                </div>
              </div>
            </motion.div>

            {/* Visual Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative h-[600px] hidden lg:block"
            >
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events-section" className="container mx-auto px-4 py-24 space-y-16">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                Discover the <span className="text-zinc-600 italic">Energy.</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('upcoming')}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    viewMode === 'upcoming' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  )}
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setViewMode('past')}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    viewMode === 'past' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  )}
                >
                  Past ({pastEvents.length})
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest self-center mr-2">Filter By</span>
              {(['all', 'online', 'offline', 'hybrid'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setLocationFilter(type)}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-bold border transition-all",
                    locationFilter === type
                      ? "bg-100x-accent-primary/10 border-100x-accent-primary text-100x-accent-primary"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[16/10] bg-zinc-900 animate-pulse rounded-[24px]" />
                ))}
              </motion.div>
            ) : filteredEvents.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredEvents.map((event) => (
                  <PublicEventCard key={event.id} event={event} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center space-y-6 bg-zinc-900/40 rounded-[40px] border border-dashed border-zinc-800"
              >
                <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-zinc-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black text-white italic">Nothing found in the archives.</p>
                  <p className="text-zinc-500 font-medium max-w-xs mx-auto text-sm">
                    Try adjusting your filters or check back later for new events.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Global CTA Section */}
        <section className="container mx-auto px-4 py-32 mb-0 text-center relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-100x-accent-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter max-w-3xl mx-auto leading-none">
              Ready to <span className="text-100x-accent-primary underline decoration-zinc-800 underline-offset-8">Spark</span> Something?
            </h2>
            <p className="text-zinc-400 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed italic">
              "An engineer is a person who can build with one dollar what any fool can build with two." - Let's build together.
            </p>
            <Link href="/login" className="inline-block mt-8">
              <ShimmerButton
                background="#ffffff"
                shimmerColor="#FF6B35"
                className="h-14 px-10 text-black font-black text-xl rounded-2xl group transition-all"
              >
                Become a Host
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              </ShimmerButton>
            </Link>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-12 border-t border-zinc-900 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
            <span className="text-white font-black text-sm">100x</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">
            Built for the 100x Engineers Community
          </p>
          <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest mt-4">
            © {new Date().getFullYear()} No Rights Reserved. Just Code.
          </p>
        </div>
      </footer>
    </div>
  )
}
