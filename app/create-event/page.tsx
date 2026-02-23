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
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/event/ImageUpload'
import { DateTimePicker } from '@/components/event/DateTimePicker'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Randomized default images
  const defaultImages = [
    '/images/1.png',
    '/images/2.png',
    '/images/3.png',
    '/images/default-event-image.png'
  ]

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
      max_capacity: 50,
      event_image_url: defaultImages[Math.floor(Math.random() * defaultImages.length)]
    }
  })

  const locationType = watch('location_type')
  const description = watch('description') || ''

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.is_admin === true)
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Convert price from rupees (what admin typed) to paise for storage/Razorpay
      const payload = {
        ...data,
        price: Math.round((data.price ?? 0) * 100)
      }

      const response = await fetch('/api/host/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    <div className="min-h-screen bg-black text-white selection:bg-100x-accent-primary/30 relative overflow-hidden">
      {/* Orange Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/15 blur-[150px] rounded-full" />
      </div>
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-zinc-400 hover:text-100x-accent-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Create a community <span className="text-100x-accent-primary">event</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Submit the details below. Events are reviewed before being published.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400"
          >
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image Upload (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="space-y-4">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                Upload an event cover image
              </Label>
              <ImageUpload
                userId={userId!}
                onChange={(url) => setValue('event_image_url', url)}
                onRemove={() => setValue('event_image_url', '/images/default-event-image.png')}
                className="shadow-2xl shadow-100x-accent-primary/5"
              />
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex gap-3 items-start">
                <Info className="w-4 h-4 text-100x-accent-primary mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Square image recommended (640x640px). This image will be shown on the event listing and event page.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Event Details Form */}
          <div className="lg:col-span-7 space-y-12 pb-24">
            {/* Section: Basic Info */}
            <div className="space-y-8">
              <div className="space-y-2 border-b border-zinc-900 pb-4">
                <h2 className="text-xl font-semibold">General Information</h2>
                <p className="text-sm text-zinc-500">Basic information about your event.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    Event Title
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Example: Intro to AI agents"
                    className="h-12 bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary text-lg"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs font-medium mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe what the session is about, who it is for, and what attendees can expect."
                    className="min-h-[160px] bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary resize-none text-base p-4"
                  />
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "text-[10px] font-medium uppercase tracking-tighter",
                        description.length < 50 || description.length > 2000 ? "text-red-400" : "text-zinc-500"
                      )}>
                        {description.length} / 2000 characters
                      </p>
                      {errors.description && (
                        <p className="text-red-400 text-xs font-medium">{errors.description.message}</p>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                      This helps community members understand what the session is about.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    Date & Time
                  </Label>
                  <DateTimePicker
                    value={watch('event_date')}
                    onChange={(val) => setValue('event_date', val)}
                    error={errors.event_date?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_capacity" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    Maximum attendees
                  </Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    {...register('max_capacity', { valueAsNumber: true })}
                    className="h-12 bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary text-base"
                  />
                  {errors.max_capacity && (
                    <p className="text-red-400 text-xs font-medium mt-1">{errors.max_capacity.message}</p>
                  )}
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    You can cap registrations if needed.
                  </p>
                </div>

                {/* Price field - admin only */}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Label htmlFor="price" className="text-100x-accent-primary text-xs uppercase tracking-wider font-semibold">
                      Event Price (Admin only)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Rs.</span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register('price', { valueAsNumber: true })}
                        className="h-12 bg-zinc-900 border-100x-accent-primary/30 focus:border-100x-accent-primary text-base pl-12"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                      Enter 0 for free events. Amount in INR. Attendees pay via Razorpay.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Section: Location */}
            <div className="space-y-8">
              <div className="space-y-2 border-b border-zinc-900 pb-4">
                <h2 className="text-xl font-semibold">Location & Format</h2>
                <p className="text-sm text-zinc-500">Where will your event take place?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    Location Type
                  </Label>
                  <Select
                    value={locationType}
                    onValueChange={(value) => setValue('location_type', value as any)}
                  >
                    <SelectTrigger className="h-12 bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary text-base">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AnimatePresence mode="wait">
                  {/* online/hybrid link */}
                  {(locationType === 'online' || locationType === 'hybrid') && (
                    <motion.div
                      key="online-link"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2 pt-2"
                    >
                      <Label htmlFor="meeting_link" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                        Meeting Link
                      </Label>
                      <Input
                        id="meeting_link"
                        {...register('meeting_link')}
                        placeholder="Paste the joining link for your event"
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary"
                      />
                      {errors.meeting_link && (
                        <p className="text-red-400 text-xs font-medium mt-1">{errors.meeting_link.message}</p>
                      )}
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                        This will be shared with registered attendees.
                      </p>
                    </motion.div>
                  )}

                  {/* offline/hybrid city */}
                  {(locationType === 'offline' || locationType === 'hybrid') && (
                    <motion.div
                      key="offline-city"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-6 pt-2"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                          City
                        </Label>
                        <Input
                          id="city"
                          {...register('city')}
                          placeholder="Mumbai"
                          className="h-12 bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary"
                        />
                        {errors.city && (
                          <p className="text-red-400 text-xs font-medium mt-1">{errors.city.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* offline/hybrid venue address */}
                  {(locationType === 'offline' || locationType === 'hybrid') && (
                    <motion.div
                      key="offline-address"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2 pt-2"
                    >
                      <Label htmlFor="venue_address" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                        Venue Address
                      </Label>
                      <Textarea
                        id="venue_address"
                        {...register('venue_address')}
                        placeholder="Exact venue location details..."
                        className="bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary min-h-[100px]"
                      />
                      {errors.venue_address && (
                        <p className="text-red-400 text-xs font-medium mt-1">{errors.venue_address.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submission Area */}
            <div className="pt-12 border-t border-zinc-900 flex flex-col sm:flex-row gap-4">
              <ShimmerButton
                type="submit"
                disabled={isSubmitting}
                shimmerColor="#ffffff"
                background="#FF6B35"
                className="h-14 flex-1 text-black font-bold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit for review"
                )}
              </ShimmerButton>
              <Link href="/dashboard" className="sm:w-32">
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl"
                >
                  Cancel
                </Button>
              </Link>
            </div>
            <p className="text-xs text-zinc-500 italic text-center w-full">
              You can track the status of your event from your dashboard.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
