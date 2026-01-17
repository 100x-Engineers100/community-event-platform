'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Event } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import RegistrationForm from '@/components/RegistrationForm'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-100x-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-100x-accent-primary animate-spin" />
          <span className="text-100x-text-secondary">Loading event...</span>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-100x-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-100x-border-default bg-100x-bg-tertiary">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-semibold text-100x-text-primary">
              {error || 'Event not found'}
            </h2>
            <p className="text-100x-text-secondary">
              The event you're looking for doesn't exist or is no longer available.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format date/time
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata')
  const formattedDate = format(istDate, 'EEEE, MMMM d, yyyy')
  const formattedTime = format(istDate, 'h:mm a')

  const locationIcon = {
    online: <Globe className="w-5 h-5 text-100x-accent-primary" />,
    offline: <Building2 className="w-5 h-5 text-100x-accent-primary" />,
    hybrid: <MapPin className="w-5 h-5 text-100x-accent-primary" />
  }

  const isFull = event.current_registrations >= event.max_capacity
  const isPastEvent = event.status === 'completed'
  const capacityPercentage = Math.min(
    (event.current_registrations / event.max_capacity) * 100,
    100
  )

  return (
    <div className="min-h-screen bg-100x-bg-primary">
      {/* Fixed Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4">
        <div
          className="max-w-5xl mx-auto rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{
            background: 'rgba(10, 10, 10, 0.6)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="px-6 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-100x-text-secondary hover:text-100x-accent-primary transition-all duration-300 p-2 hover:bg-100x-accent-primary/5 hover:shadow-[0_0_15px_rgba(249,104,70,0.3)]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-semibold">Back to Events</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-100x-accent-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">100x</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status */}
            <div>
              {isPastEvent && (
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-300 border border-blue-900/50">
                  Past Event
                </span>
              )}
              {isFull && !isPastEvent && (
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-900/50">
                  Event Full
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-100x-text-primary mb-4">
                {event.title}
              </h1>
            </div>

            {/* Description */}
            <Card className="border-100x-border-default bg-100x-bg-tertiary">
              <CardHeader>
                <h2 className="text-lg font-semibold text-100x-text-primary">
                  About This Event
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-100x-text-secondary leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Venue Details (for offline/hybrid) */}
            {event.venue_address && (
              <Card className="border-100x-border-default bg-100x-bg-tertiary">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-100x-text-primary">
                    Venue
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-100x-text-secondary whitespace-pre-wrap">
                    {event.venue_address}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Event Info & Registration */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <Card className="border-100x-border-default bg-100x-bg-tertiary">
              <CardHeader>
                <h2 className="text-lg font-semibold text-100x-text-primary">
                  Event Details
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-100x-accent-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-100x-text-primary">
                      {formattedDate}
                    </p>
                    <p className="text-xs text-100x-text-muted mt-0.5">
                      Date
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-100x-accent-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-100x-text-primary">
                      {formattedTime} IST
                    </p>
                    <p className="text-xs text-100x-text-muted mt-0.5">
                      Time
                    </p>
                  </div>
                </div>

                {/* Location Type */}
                <div className="flex items-start gap-3">
                  {locationIcon[event.location_type]}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-100x-text-primary capitalize">
                      {event.location_type}
                    </p>
                    {event.city && (
                      <p className="text-xs text-100x-text-secondary mt-0.5">
                        {event.city}
                      </p>
                    )}
                    <p className="text-xs text-100x-text-muted mt-0.5">
                      Location
                    </p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="pt-4 border-t border-100x-border-default">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-100x-accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-100x-text-primary">
                        {event.current_registrations} / {event.max_capacity} registered
                      </p>
                      {isFull && (
                        <p className="text-xs text-red-400 mt-0.5 font-semibold">
                          Event is full
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-100x-bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        isFull ? 'bg-red-500' : 'bg-100x-accent-primary'
                      )}
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            {!isPastEvent && !isFull && (
              <RegistrationForm eventId={eventId} eventTitle={event.title} />
            )}

            {/* Registration Full Message */}
            {!isPastEvent && isFull && (
              <Card className="border-100x-border-default bg-100x-bg-tertiary">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-100x-text-primary">
                    Registration Full
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-100x-text-secondary">
                    This event has reached maximum capacity. Registration is closed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
