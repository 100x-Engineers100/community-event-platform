
export type LocationType = 'online' | 'offline' | 'hybrid'

export type EventStatus =
  | 'submitted'
  | 'published'
  | 'rejected'
  | 'expired'
  | 'completed'

export interface Profile {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  cohort: string | null
  created_at: string
}

export interface Event {
  id: string
  host_id: string
  title: string
  description: string
  event_date: string
  location_type: LocationType
  city: string | null
  meeting_link: string | null
  venue_address: string | null
  max_capacity: number
  current_registrations: number
  price: number
  status: EventStatus
  rejection_reason: string | null
  created_at: string
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  expires_at: string
  event_image_url: string
  host?: {
    is_admin: boolean
    cohort: string | null
  }
}

export interface Registration {
  id: string
  event_id: string
  attendee_name: string
  attendee_email: string
  whatsapp_number?: string
  registered_at: string
  razorpay_order_id?: string | null
  razorpay_payment_id?: string | null
  payment_status: 'free' | 'pending' | 'paid' | 'failed'
}

export interface DailySubmission {
  id: string
  email: string
  whatsapp_number?: string
  registration_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
}
