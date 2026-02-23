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
import { cn } from '@/lib/utils'

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

      <div className="relative group overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-orange-500/5">
        {/* Floating Price Badge */}
        <div className="absolute top-0 right-0 mt-6 mr-6 transform group-hover:scale-105 transition-transform duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-100x-accent-primary/20 blur-xl rounded-full" />
            <div className="relative px-5 py-2.5 bg-zinc-950/80 backdrop-blur-md border border-100x-accent-primary/30 rounded-2xl flex items-center gap-2 shadow-xl">
              <span className="text-[12px] font-black uppercase tracking-widest text-zinc-500">Fee - </span>
              <span className="text-100x-accent-primary font-black text-l tracking-tighter">
                ₹{priceInRupees.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-100x-accent-primary/10 rounded-xl flex items-center justify-center border border-100x-accent-primary/20">
            <CreditCard className="w-5 h-5 text-100x-accent-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Register & Pay</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Secure Checkout</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="attendee_name" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                Full Name
              </Label>
              <Input
                id="attendee_name"
                type="text"
                placeholder="John Doe"
                className={cn(
                  "bg-white/5 border-white/5 text-white placeholder:text-zinc-600 focus:border-100x-accent-primary/50 focus:bg-white/[0.07] h-12 rounded-2xl transition-all",
                  errors.attendee_name && "border-red-500/50"
                )}
                {...register('attendee_name')}
                disabled={isProcessing}
              />
              {errors.attendee_name && (
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 mt-1">{errors.attendee_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="attendee_email" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                Email Address
              </Label>
              <Input
                id="attendee_email"
                type="email"
                placeholder="john@example.com"
                className={cn(
                  "bg-white/5 border-white/5 text-white placeholder:text-zinc-600 focus:border-100x-accent-primary/50 focus:bg-white/[0.07] h-12 rounded-2xl transition-all",
                  errors.attendee_email && "border-red-500/50"
                )}
                {...register('attendee_email')}
                disabled={isProcessing}
              />
              {errors.attendee_email && (
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 mt-1">{errors.attendee_email.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp_number"
                type="text"
                placeholder="+91 9876543210"
                className={cn(
                  "bg-white/5 border-white/5 text-white placeholder:text-zinc-600 focus:border-100x-accent-primary/50 focus:bg-white/[0.07] h-12 rounded-2xl transition-all",
                  errors.whatsapp_number && "border-red-500/50"
                )}
                {...register('whatsapp_number')}
                disabled={isProcessing}
              />
              {errors.whatsapp_number && (
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 mt-1">{errors.whatsapp_number.message}</p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="relative group/terms p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/[0.07]">
            <div className="flex items-start gap-4">
              <div className="pt-1">
                <input
                  id="terms_accepted"
                  type="checkbox"
                  className="w-4 h-4 accent-100x-accent-primary cursor-pointer rounded-lg"
                  {...register('terms_accepted')}
                  disabled={isProcessing}
                />
              </div>
              <Label htmlFor="terms_accepted" className="text-xs text-zinc-400 font-medium leading-relaxed cursor-pointer select-none">
                I agree to the <span className="text-white hover:text-100x-accent-primary transition-colors cursor-pointer">Terms & Conditions</span>. I understand payments are non-refundable unless the event is cancelled.
              </Label>
            </div>
          </div>
          {errors.terms_accepted && (
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 mt-1">{errors.terms_accepted.message}</p>
          )}

          {/* Error */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
            </Alert>
          )}

          {/* Pay Button */}
          <div className="pt-2">
            <ShimmerButton
              type="submit"
              disabled={isProcessing}
              shimmerColor="#ffffff"
              background="#FF6B35"
              className="w-full h-14 text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-100x-accent-primary/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing order...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Lock className="w-5 h-5" />
                  <span>Secure Pay ₹{priceInRupees.toLocaleString('en-IN')}</span>
                </div>
              )}
            </ShimmerButton>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex items-center gap-4 py-2 px-6 bg-white/5 rounded-full border border-white/5">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                  <span className="text-[6px] font-bold text-white">VISA</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                  <span className="text-[6px] font-bold text-white">UPI</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                  <span className="text-[6px] font-bold text-white">MC</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Lock className="w-2.5 h-2.5" />
                PCI DSS Compliant
              </span>
            </div>
            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-wider text-center">
              Payments are encrypted and processed securely via Razorpay
            </p>
          </div>
        </form>
      </div>
    </>
  )
}
