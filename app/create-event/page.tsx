'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { eventFormSchema, EventFormData } from '@/lib/validations/event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      location_type: 'online',
      max_capacity: 50
    }
  })

  const locationType = watch('location_type')

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/host/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create event')
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Submission error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-100x-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-100x-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-100x-bg-primary">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 text-100x-text-secondary hover:text-100x-accent-primary hover:bg-100x-bg-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-100x-text-primary mb-2">
            Create Event
          </h1>
          <p className="text-100x-text-secondary">
            Submit your event for review. All events are reviewed before publishing.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-900/40">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card className="border-100x-border-default bg-100x-bg-tertiary">
          <CardHeader>
            <CardTitle className="text-100x-text-primary">Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-100x-text-primary">
                  Event Title <span className="text-100x-accent-primary">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., AI Workshop: Building LLM Applications"
                  className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-100x-text-primary">
                  Description <span className="text-100x-accent-primary">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your event (50-1000 characters)"
                  rows={5}
                  className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                />
                <p className="text-100x-text-muted text-xs mt-1">
                  {watch('description')?.length || 0} / 1000 characters
                </p>
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Date & Time */}
              <div>
                <Label htmlFor="event_date" className="text-100x-text-primary">
                  Event Date & Time (IST) <span className="text-100x-accent-primary">*</span>
                </Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  {...register('event_date')}
                  className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                />
                {errors.event_date && (
                  <p className="text-red-400 text-sm mt-1">{errors.event_date.message}</p>
                )}
              </div>

              {/* Location Type */}
              <div>
                <Label htmlFor="location_type" className="text-100x-text-primary">
                  Location Type <span className="text-100x-accent-primary">*</span>
                </Label>
                <Select
                  value={locationType}
                  onValueChange={(value) => setValue('location_type', value as 'online' | 'offline' | 'hybrid')}
                >
                  <SelectTrigger className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-100x-bg-secondary border-100x-border-default">
                    <SelectItem value="online" className="text-100x-text-primary">Online</SelectItem>
                    <SelectItem value="offline" className="text-100x-text-primary">Offline</SelectItem>
                    <SelectItem value="hybrid" className="text-100x-text-primary">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional: Meeting Link (Online/Hybrid) */}
              {(locationType === 'online' || locationType === 'hybrid') && (
                <div>
                  <Label htmlFor="meeting_link" className="text-100x-text-primary">
                    Meeting Link <span className="text-100x-accent-primary">*</span>
                  </Label>
                  <Input
                    id="meeting_link"
                    {...register('meeting_link')}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                  />
                  {errors.meeting_link && (
                    <p className="text-red-400 text-sm mt-1">{errors.meeting_link.message}</p>
                  )}
                </div>
              )}

              {/* Conditional: City (Offline/Hybrid) */}
              {(locationType === 'offline' || locationType === 'hybrid') && (
                <div>
                  <Label htmlFor="city" className="text-100x-text-primary">
                    City <span className="text-100x-accent-primary">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="e.g., Bangalore"
                    className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
              )}

              {/* Conditional: Venue Address (Offline only) */}
              {locationType === 'offline' && (
                <div>
                  <Label htmlFor="venue_address" className="text-100x-text-primary">
                    Venue Address <span className="text-100x-accent-primary">*</span>
                  </Label>
                  <Textarea
                    id="venue_address"
                    {...register('venue_address')}
                    placeholder="Full venue address"
                    rows={3}
                    className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                  />
                  {errors.venue_address && (
                    <p className="text-red-400 text-sm mt-1">{errors.venue_address.message}</p>
                  )}
                </div>
              )}

              {/* Max Capacity */}
              <div>
                <Label htmlFor="max_capacity" className="text-100x-text-primary">
                  Max Capacity <span className="text-100x-accent-primary">*</span>
                </Label>
                <Input
                  id="max_capacity"
                  type="number"
                  {...register('max_capacity', { valueAsNumber: true })}
                  min={5}
                  max={500}
                  className="mt-1.5 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary"
                />
                <p className="text-100x-text-muted text-xs mt-1">
                  Minimum 5, Maximum 500 attendees
                </p>
                {errors.max_capacity && (
                  <p className="text-red-400 text-sm mt-1">{errors.max_capacity.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Event'
                  )}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full border-100x-border-default text-100x-text-secondary hover:text-100x-accent-primary"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Alert className="mt-6 bg-100x-bg-secondary border-100x-border-default">
          <AlertDescription className="text-100x-text-secondary text-sm">
            <strong className="text-100x-text-primary">Note:</strong> Events are reviewed within 7 days.
            If not reviewed, they will expire and you can resubmit. You can submit up to 3 events per day.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
