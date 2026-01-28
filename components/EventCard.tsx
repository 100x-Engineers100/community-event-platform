'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { Profile, Event } from '@/lib/types'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar, MapPin, Users, Globe, Building2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SafeImage } from './event/SafeImage'

interface EventCardProps {
  event: Event
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  // Convert to IST for display
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata')
  const formattedDate = format(istDate, 'MMM do')
  const formattedTime = format(istDate, 'p')

  const locationIcon = {
    online: <Globe className="w-3.5 h-3.5" />,
    offline: <Building2 className="w-3.5 h-3.5" />,
    hybrid: <MapPin className="w-3.5 h-3.5" />
  }

  const isExpired = event.status === 'expired'
  const isRejected = event.status === 'rejected'
  const isApproved = event.status === 'published' || event.status === 'completed'

  return (
    <Card
      className={cn(
        'group relative transition-all duration-500 border-zinc-800 bg-zinc-900/40 backdrop-blur-xl overflow-hidden rounded-[24px]',
        'hover:border-100x-accent-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1',
        className
      )}
    >
      {/* Event Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <SafeImage
          src={event.event_image_url}
          alt={event.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Status Badge Over Image */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={event.status} />
        </div>

        {/* Floating Date Badge */}
        <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-100x-accent-primary" />
          <span className="text-xs font-bold text-white tracking-tight">{formattedDate}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white leading-tight line-clamp-1 group-hover:text-100x-accent-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-xs font-medium text-zinc-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-400 capitalize">
            {locationIcon[event.location_type]}
            {event.location_type}
          </div>
          {event.city && (
            <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-400">
              <MapPin className="w-3.5 h-3.5" />
              {event.city}
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="pt-4 border-t border-zinc-800/50">
          {isApproved ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-zinc-600">Attendance</span>
                <span className={cn(
                  event.current_registrations >= event.max_capacity ? "text-red-500" : "text-100x-accent-primary"
                )}>
                  {event.current_registrations} / {event.max_capacity}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isApproved ? "bg-100x-accent-primary" : "bg-zinc-700"
                  )}
                  style={{
                    width: `${Math.min((event.current_registrations / event.max_capacity) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-2 text-100x-accent-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Resubmit Ready</span>
            </div>
          ) : isRejected ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-red-400/80 line-clamp-1">
                Rejected: {event.rejection_reason}
              </p>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-zinc-600 italic">
              Under review by the 100x team
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
