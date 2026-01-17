import { z } from 'zod'
import { LocationType } from '@/lib/types'

export const eventFormSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),

  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description must be less than 1000 characters'),

  event_date: z.string()
    .refine((date) => {
      const eventDate = new Date(date)
      return eventDate > new Date()
    }, 'Event date must be in the future'),

  location_type: z.enum(['online', 'offline', 'hybrid'] as const),

  city: z.string().optional(),

  meeting_link: z.string().optional(),

  venue_address: z.string().optional(),

  max_capacity: z.number()
    .min(5, 'Minimum capacity is 5')
    .max(500, 'Maximum capacity is 500')
})
.superRefine((data, ctx) => {
  // Online: requires meeting_link
  if (data.location_type === 'online') {
    if (!data.meeting_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Meeting link is required for online events',
        path: ['meeting_link']
      })
    } else if (!isValidUrl(data.meeting_link)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid URL',
        path: ['meeting_link']
      })
    }
  }

  // Offline: requires city and venue_address
  if (data.location_type === 'offline') {
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'City is required for offline events',
        path: ['city']
      })
    }
    if (!data.venue_address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Venue address is required for offline events',
        path: ['venue_address']
      })
    }
  }

  // Hybrid: requires city and meeting_link
  if (data.location_type === 'hybrid') {
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'City is required for hybrid events',
        path: ['city']
      })
    }
    if (!data.meeting_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Meeting link is required for hybrid events',
        path: ['meeting_link']
      })
    } else if (!isValidUrl(data.meeting_link)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid URL',
        path: ['meeting_link']
      })
    }
  }
})

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export type EventFormData = z.infer<typeof eventFormSchema>
