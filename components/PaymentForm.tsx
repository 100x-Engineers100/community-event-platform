'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, RegistrationFormData } from '@/lib/validations/registration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Loader2, AlertCircle, CreditCard, Lock } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  modal: { ondismiss: () => void }
  handler: (response: RazorpayResponse) => void
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface PaymentFormProps {
  eventId: string
  eventTitle: string
  price: number // in paise
}

export default function PaymentForm({ eventId, eventTitle, price }: PaymentFormProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const priceInRupees = price / 100

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { attendee_name: '', attendee_email: '', terms_accepted: false },
  })

  const onSubmit = async (data: RegistrationFormData) => {
    if (!scriptLoaded) {
      setError('Payment system is loading. Please try again in a moment.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // [STEP 1] Create Razorpay order server-side
      const orderRes = await fetch(`/api/events/${eventId}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendee_name: data.attendee_name,
          attendee_email: data.attendee_email,
          whatsapp_number: data.whatsapp_number,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        setError(orderData.details || orderData.error || 'Failed to create order. Please try again.')
        setIsProcessing(false)
        return
      }

      // [STEP 2] Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: '100x Engineers',
        description: eventTitle,
        order_id: orderData.order_id,
        prefill: {
          name: data.attendee_name,
          email: data.attendee_email,
          contact: data.whatsapp_number || '',
        },
        theme: { color: '#F96846' },
        modal: {
          ondismiss: () => {
            // User closed modal - re-enable button for retry
            // Old pending order is cleaned up on next create-order call
            setIsProcessing(false)
            setError('Payment cancelled. You can try again.')
          },
        },
        handler: async (response: RazorpayResponse) => {
          // [STEP 3] Verify payment server-side
          try {
            const verifyRes = await fetch(`/api/events/${eventId}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (!verifyRes.ok) {
              setError(verifyData.error || 'Payment verification failed. Contact support if amount was deducted.')
              setIsProcessing(false)
              return
            }

            // [STEP 4] Redirect to confirmation page
            router.push(`/events/${verifyData.event_id}/confirmation?registration_id=${verifyData.registration_id}`)
          } catch {
            setError('Network error during verification. If payment was deducted, contact community@100xengineers.com')
            setIsProcessing(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('[PAYMENT] Error:', err)
      setError('Something went wrong. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      <div className="bg-100x-bg-tertiary border border-100x-border-default rounded-lg p-6">
        {/* Price Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-100x-accent-primary" />
            <h3 className="text-lg font-semibold text-100x-text-primary">Register & Pay</h3>
          </div>
          <div className="px-4 py-1.5 bg-100x-accent-primary/10 border border-100x-accent-primary/30 rounded-full">
            <span className="text-100x-accent-primary font-black text-lg">
              Rs. {priceInRupees.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="attendee_name" className="text-100x-text-primary">
              Full Name <span className="text-100x-accent-primary">*</span>
            </Label>
            <Input
              id="attendee_name"
              type="text"
              placeholder="John Doe"
              className={`bg-white border-100x-border-default text-black placeholder:text-gray-400 focus:border-100x-accent-primary h-12 ${errors.attendee_name ? 'border-red-500' : ''}`}
              {...register('attendee_name')}
              disabled={isProcessing}
            />
            {errors.attendee_name && (
              <p className="text-sm text-red-500">{errors.attendee_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="attendee_email" className="text-100x-text-primary">
              Email Address <span className="text-100x-accent-primary">*</span>
            </Label>
            <Input
              id="attendee_email"
              type="email"
              placeholder="john@example.com"
              className={`bg-white border-100x-border-default text-black placeholder:text-gray-400 focus:border-100x-accent-primary h-12 ${errors.attendee_email ? 'border-red-500' : ''}`}
              {...register('attendee_email')}
              disabled={isProcessing}
            />
            {errors.attendee_email && (
              <p className="text-sm text-red-500">{errors.attendee_email.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number" className="text-100x-text-primary">
              WhatsApp Number <span className="text-100x-accent-primary">*</span>
              <span className="block text-xs text-zinc-500 font-normal mt-1">Used only for event-related updates.</span>
            </Label>
            <Input
              id="whatsapp_number"
              type="text"
              placeholder="+91 9876543210"
              className={`bg-white border-100x-border-default text-black placeholder:text-gray-400 focus:border-100x-accent-primary h-12 ${errors.whatsapp_number ? 'border-red-500' : ''}`}
              {...register('whatsapp_number')}
              disabled={isProcessing}
            />
            {errors.whatsapp_number && (
              <p className="text-sm text-red-500">{errors.whatsapp_number.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              id="terms_accepted"
              type="checkbox"
              className="mt-1 w-4 h-4 accent-100x-accent-primary cursor-pointer"
              {...register('terms_accepted')}
              disabled={isProcessing}
            />
            <Label htmlFor="terms_accepted" className="text-sm text-100x-text-secondary cursor-pointer">
              I agree to receive event-related updates and understand this payment is non-refundable.
            </Label>
          </div>
          {errors.terms_accepted && (
            <p className="text-sm text-red-500 -mt-2">{errors.terms_accepted.message}</p>
          )}

          {/* Error */}
          {error && (
            <Alert className="bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pay Button */}
          <ShimmerButton
            type="submit"
            disabled={isProcessing}
            shimmerColor="#ffffff"
            background="#FF6B35"
            className="w-full text-black font-bold py-4 uppercase tracking-wider rounded-lg disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay Rs. {priceInRupees.toLocaleString('en-IN')} & Register
              </>
            )}
          </ShimmerButton>

          <div className="flex items-center justify-center gap-2 mt-3">
            <Lock className="w-3 h-3 text-zinc-600" />
            <p className="text-xs text-zinc-600 text-center">
              Secured by Razorpay. Supports UPI, cards, net banking.
            </p>
          </div>
        </form>
      </div>
    </>
  )
}
