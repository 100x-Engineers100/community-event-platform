'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar, MapPin, Users, Globe, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PublicEventCardProps {
  event: Event
  className?: string
}

export function PublicEventCard({ event, className }: PublicEventCardProps) {
  // Convert to IST for display
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata')
  const formattedDate = format(istDate, 'PPP')
  const formattedTime = format(istDate, 'p')

  const locationIcon = {
    online: <Globe className="w-4 h-4" />,
    offline: <Building2 className="w-4 h-4" />,
    hybrid: <MapPin className="w-4 h-4" />
  }

  const isFull = event.current_registrations >= event.max_capacity
  const capacityPercentage = Math.min(
    (event.current_registrations / event.max_capacity) * 100,
    100
  )

  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card
        className={cn(
          'group relative transition-all duration-300 cursor-pointer',
          'border-100x-border-default bg-100x-bg-tertiary',
          'hover:border-100x-accent-primary hover:shadow-[0_0_20px_rgba(249,104,70,0.2)]',
          'hover:translate-y-[-2px]',
          className
        )}
      >
        {/* Full Badge */}
        {isFull && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10 font-semibold">
            Full
          </div>
        )}

        <CardHeader className="space-y-3">
          <h3 className="text-xl font-bold text-100x-text-primary line-clamp-2 group-hover:text-100x-accent-light transition-colors">
            {event.title}
          </h3>

          <p className="text-sm text-100x-text-secondary line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-100x-text-secondary">
            <Calendar className="w-4 h-4 text-100x-accent-primary" />
            <span>
              {formattedDate} <span className="text-100x-text-muted">•</span> {formattedTime} IST
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-100x-text-secondary">
            {locationIcon[event.location_type]}
            <span className="capitalize">{event.location_type}</span>
            {event.city && <span className="text-100x-text-muted">• {event.city}</span>}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-100x-accent-primary" />
              <span className="text-100x-text-secondary">
                {event.current_registrations}/{event.max_capacity} registered
              </span>
              {isFull && (
                <span className="text-xs text-red-400 font-semibold">
                  • Event Full
                </span>
              )}
            </div>

            {/* Progress bar */}
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

          {/* Call to Action hint */}
          <div className="pt-2 border-t border-100x-border-default mt-4">
            <span className="text-xs text-100x-accent-light group-hover:text-100x-accent-primary transition-colors">
              Click to view details {!isFull && '& register'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
