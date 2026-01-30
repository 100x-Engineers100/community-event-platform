'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Event } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Building2,
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  Share2,
  Sparkles,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import RegistrationForm from '@/components/RegistrationForm'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { motion, AnimatePresence } from 'framer-motion'
import { SafeImage } from '@/components/event/SafeImage'
import { getEventDisplayImage } from '@/lib/utils/event-images'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}`)

      if (!res.ok) {
        if (res.status === 404) {
          setError('Event not found')
        } else {
          setError('Failed to load event')
        }
        return
      }

      const data = await res.json()
      setEvent(data.event)
      setError(null)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to load event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const eventUrl = `${window.location.origin}/events/${eventId}`

    try {
      await navigator.clipboard.writeText(eventUrl)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = eventUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-100x-accent-primary animate-spin" />
          <span className="text-zinc-500 font-medium">Loading event details...</span>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {error || 'Event not found'}
          </h2>
          <p className="text-zinc-400">
            The event you're looking for doesn't exist or is no longer available for registration.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full h-12 bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-black font-bold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  // Format date/time
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata')
  const formattedDate = format(istDate, 'EEEE, MMMM d')
  const formattedYear = format(istDate, 'yyyy')
  const formattedTime = format(istDate, 'h:mm a')

  const locationIcon = {
    online: <Globe className="w-5 h-5" />,
    offline: <Building2 className="w-5 h-5" />,
    hybrid: <MapPin className="w-5 h-5" />
  }

  const isFull = event.current_registrations >= event.max_capacity
  const isDatePast = new Date(event.event_date) < new Date()
  const isPastEvent = event.status === 'completed' || isDatePast

  return (
    <div className="min-h-screen bg-black text-white selection:bg-100x-accent-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between pointer-events-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="h-10 px-4 backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back
          </Button>

          <div className="flex items-center gap-6">
            {/* Aesthetic Share Suggestion */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}

            >

              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 group-hover/share-msg:text-white transition-colors">
                share with <span className="text-100x-accent-primary">100x folks</span>
              </span>
            </motion.div>

            <Button
              variant="ghost"
              onClick={handleShare}
              className="w-10 h-10 p-0 backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all relative group"
            >
              <Share2 className={cn(
                "w-4 h-4 transition-all",
                shareSuccess && "scale-0"
              )} />
              {shareSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-100x-accent-primary" />
                </motion.div>
              )}
            </Button>

            {/* Toast notification */}
            <AnimatePresence>
              {shareSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute right-10 top-14 backdrop-blur-xl bg-100x-accent-primary/90 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  Link copied!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-4 pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left Column: Image & Registration Form */}
          <div className="lg:col-span-5 space-y-10">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square w-full overflow-hidden rounded-[40px] shadow-2xl shadow-100x-accent-primary/10 border border-white/5"
            >
              <SafeImage
                src={getEventDisplayImage(event.id, event.event_image_url)}
                alt={event.title}
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />


            </motion.div>

            {/* About / Description (MOVED FROM RIGHT) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                <div className="w-1.5 h-1.5 bg-100x-accent-primary rounded-full animate-pulse" />
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">About the event</span>
              </div>


              <div className="space-y-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {event.description}
                  </p>
                </div>

                {/* Hosted By (Staged) */}
                <div className="pt-8 border-t border-zinc-900 flex items-center gap-4">
                  <div className="w-12 h-12 bg-100x-accent-primary rounded-2xl flex items-center justify-center">
                    <span className="text-black font-black text-sm">100x</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hosted by</p>
                    <p className="font-bold text-white">100x community member</p>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-600 font-medium italic mt-8 border-l border-zinc-900 pl-4">
                  * No production environments were harmed during the planning of this event.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Event Info & Description */}
          <div className="lg:col-span-7 space-y-12">
            {/* Core Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-100x-accent-primary/10 text-100x-accent-primary text-xs font-bold uppercase tracking-widest border border-100x-accent-primary/20">
                    {event.location_type}
                  </span>
                  {isFull && !isPastEvent && (
                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/20">
                      Full Capacity
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  {event.title}
                </h1>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800/50">
                {/* Date & Time */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{format(istDate, 'MMM')}</span>
                      <span className="text-lg font-black leading-none">{format(istDate, 'd')}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white leading-tight">
                        {formattedDate}, {formattedYear}
                      </p>
                      <p className="text-sm font-medium text-zinc-500">
                        Starting at {formattedTime} IST
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-100x-accent-primary">
                      {locationIcon[event.location_type]}
                    </div>
                    <div className="space-y-1 text-zinc-400">
                      <p className="font-bold text-white capitalize leading-tight">
                        {event.location_type === 'online' ? 'Virtual Event' : (event.city || 'In-Person')}
                      </p>
                      <p className="text-sm font-medium">
                        {event.location_type === 'online' ? 'Joining link upon registration' : (event.venue_address || 'Address visible to registered guests')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6 border-t sm:border-t-0 sm:border-l border-zinc-800/50 pt-6 sm:pt-0 sm:pl-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-zinc-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white leading-tight">
                        {event.current_registrations} / {event.max_capacity}
                      </p>
                      <p className="text-sm font-medium text-zinc-500">
                        Guests Registered
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(event.current_registrations / event.max_capacity) * 100}%` }}
                        className={cn(
                          "h-full transition-colors",
                          isFull ? "bg-red-500" : "bg-100x-accent-primary"
                        )}
                      />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">
                      {Math.round((event.current_registrations / event.max_capacity) * 100)}% Capacity reached
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Registration Section (MOVED FROM LEFT) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl"
            >
              {!isPastEvent && !isFull ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold ">Register for the event</h3>
                      <Sparkles className="w-5 h-5 text-100x-accent-primary animate-pulse" />
                    </div>
                    <p className="text-zinc-500 font-medium">Register to attend. Event details will be shared after registration.</p>
                  </div>
                  <RegistrationForm eventId={eventId} eventTitle={event.title} />
                </div>
              ) : (
                <div className="p-8 rounded-[32px] bg-zinc-900/50 border border-zinc-800 text-center space-y-4 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto relative z-10">
                    <AlertCircle className="w-6 h-6 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-bold relative z-10">
                    {isPastEvent ? "Too late, Chief!" : "Capacity Full"}
                  </h3>
                  <p className="text-zinc-500 relative z-10">
                    {isPastEvent
                      ? "Event has been completed, you can register in more bangers! This one is already in the history books."
                      : "We're packed! But don't worry, there's always more coming."}
                  </p>
                  <ShimmerButton
                    onClick={() => router.push('/')}
                    shimmerColor="#ffffff"
                    background="#FF6B35"
                    className="w-full text-black font-black transition-all rounded-xl"
                  >
                    Explore other Bangers
                  </ShimmerButton>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer / Copyright */}
      <footer className="max-w-[1200px] mx-auto px-4 py-12 border-t border-zinc-900 text-center">
        <p className="text-xs font-medium text-zinc-600">
          © {new Date().getFullYear()} 100x Engineers. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
