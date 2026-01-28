export type Affiliation =
  | '100x Alumni'
  | 'Current Cohort'
  | 'Friend of 100x'
  | 'Partner Community'

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
  affiliation: Affiliation
  is_admin: boolean
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
  }
}

export interface Registration {
  id: string
  event_id: string
  attendee_name: string
  attendee_email: string
  whatsapp_number?: string
  registered_at: string
}

export interface DailySubmission {
  id: string
  email: string
  whatsapp_number?: string
  registration_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
}
