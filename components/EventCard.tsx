'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar, MapPin, Users, Globe, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: Event
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  // Convert to IST for display
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata')
  const formattedDate = format(istDate, 'PPP')
  const formattedTime = format(istDate, 'p')

  const locationIcon = {
    online: <Globe className="w-4 h-4" />,
    offline: <Building2 className="w-4 h-4" />,
    hybrid: <MapPin className="w-4 h-4" />
  }

  const isExpired = event.status === 'expired'
  const isRejected = event.status === 'rejected'
  const isApproved = event.status === 'published' || event.status === 'completed'

  return (
    <Card
      className={cn(
        'group relative transition-all duration-300 border-100x-border-default bg-100x-bg-tertiary',
        'hover:border-100x-accent-primary hover:shadow-[0_0_20px_rgba(249,104,70,0.2)]',
        className
      )}
    >
      {/* Expired/Rejected Banner */}
      {isExpired && (
        <div className="absolute -top-2 -right-2 bg-100x-accent-primary text-white text-xs px-3 py-1 rounded-full shadow-lg z-10">
          Resubmit Available
        </div>
      )}

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-100x-text-primary line-clamp-2 flex-1">
            {event.title}
          </h3>
          <StatusBadge status={event.status} />
        </div>

        <p className="text-sm text-100x-text-secondary line-clamp-3">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-100x-text-secondary">
          <Calendar className="w-4 h-4 text-100x-accent-primary" />
          <span>{formattedDate} at {formattedTime} IST</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-100x-text-secondary">
          {locationIcon[event.location_type]}
          <span className="capitalize">{event.location_type}</span>
          {event.city && <span className="text-100x-text-muted">• {event.city}</span>}
        </div>

        {/* Capacity (only for approved events) */}
        {isApproved && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-100x-accent-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-100x-text-secondary">
                  {event.current_registrations}/{event.max_capacity} registered
                </span>
                {event.current_registrations >= event.max_capacity && (
                  <span className="text-xs bg-red-900 text-white px-2 py-0.5 rounded">
                    Full
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="mt-1.5 w-full bg-100x-bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-100x-accent-primary h-full transition-all duration-300"
                  style={{
                    width: `${Math.min((event.current_registrations / event.max_capacity) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {isRejected && event.rejection_reason && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-900/40 rounded-md">
            <p className="text-sm text-red-200">
              <span className="font-semibold">Reason: </span>
              {event.rejection_reason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
