'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar, MapPin, Users, Globe, Building2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { SafeImage } from './event/SafeImage'

interface PublicEventCardProps {
  event: Event
  className?: string
}

export function PublicEventCard({ event, className }: PublicEventCardProps) {
  // Convert to IST for display
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata')
  const formattedDate = format(istDate, 'MMM do')
  const formattedTime = format(istDate, 'p')

  const locationIcon = {
    online: <Globe className="w-3.5 h-3.5" />,
    offline: <Building2 className="w-3.5 h-3.5" />,
    hybrid: <MapPin className="w-3.5 h-3.5" />
  }

  const isFull = event.current_registrations >= event.max_capacity
  const capacityPercentage = Math.min(
    (event.current_registrations / event.max_capacity) * 100,
    100
  )

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card
        className={cn(
          'relative transition-all duration-500 border-zinc-800 bg-zinc-900/40 backdrop-blur-xl overflow-hidden rounded-[24px]',
          'hover:border-100x-accent-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1',
          className
        )}
      >
        {/* Event Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
          </div>
          <SafeImage
            src={event.event_image_url}
            alt={event.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

          {/* Status Badge (Capacity) Over Image */}
          <div className="absolute top-4 right-4">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md",
              new Date(event.event_date) < new Date()
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-400"
                : isFull
                  ? "bg-red-500/20 border-red-500/50 text-red-500"
                  : "bg-100x-accent-primary/20 border-100x-accent-primary/50 text-100x-accent-primary"
            )}>
              {new Date(event.event_date) < new Date() ? "Closed" : isFull ? "Sold Out" : "RSVP open"}
            </div>
          </div>

          {/* Floating Date Badge */}
          <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-100x-accent-primary" />
            <span className="text-xs font-bold text-white tracking-tight">{formattedDate}</span>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white leading-tight line-clamp-1 group-hover:text-100x-accent-primary transition-colors italic">
              {event.title}
            </h3>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
              Hosted by a 100x community member
            </p>
            <p className="text-[10px] font-medium text-zinc-500 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-0.5 rounded-full text-[9px] font-bold text-zinc-400 capitalize">
              {locationIcon[event.location_type]}
              {event.location_type}
            </div>
            {event.city && (
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-0.5 rounded-full text-[9px] font-bold text-zinc-400">
                <MapPin className="w-3 h-3" />
                {event.city}
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-0.5 rounded-full text-[9px] font-bold text-zinc-400">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </div>
          </div>

          {/* Footer Area */}
          <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">RSVPs</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-white">{event.current_registrations}</span>
                <span className="text-[9px] font-bold text-zinc-600">/ {event.max_capacity}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-all group-hover:bg-100x-accent-primary group-hover:text-white">
              View Details
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
