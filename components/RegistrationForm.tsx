'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationFormData } from '@/lib/validations/registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCheck, AlertCircle } from 'lucide-react';

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
}

export default function RegistrationForm({ eventId, eventTitle }: RegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      attendee_name: '',
      attendee_email: '',
      terms_accepted: false
    }
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Remove terms_accepted before sending to API (not stored in DB)
      const { terms_accepted, ...registrationData } = data;

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          setError('You are already registered for this event with this email address.');
        } else if (response.status === 400) {
          setError(result.details || result.error || 'Registration failed. Please check your information.');
        } else {
          setError(result.error || 'Something went wrong. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to confirmation page with registration ID
      router.push(`/events/${eventId}/confirmation?registration_id=${result.registration.id}`);

    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-100x-bg-tertiary border border-100x-border-default rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="w-5 h-5 text-100x-accent-primary" />
        <h3 className="text-lg font-semibold text-100x-text-primary">Register for this Event</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="attendee_name" className="text-100x-text-primary">
            Full Name <span className="text-100x-accent-primary">*</span>
          </Label>
          <Input
            id="attendee_name"
            type="text"
            placeholder="John Doe"
            className={`bg-white border-100x-border-default text-black placeholder:text-gray-400 focus:border-100x-accent-primary focus:ring-1 focus:ring-100x-accent-primary h-12 ${errors.attendee_name ? 'border-red-500' : ''
              }`}
            {...register('attendee_name')}
            disabled={isSubmitting}
          />
          {errors.attendee_name && (
            <p className="text-sm text-red-500">{errors.attendee_name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="attendee_email" className="text-100x-text-primary">
            Email Address <span className="text-100x-accent-primary">*</span>
          </Label>
          <Input
            id="attendee_email"
            type="email"
            placeholder="john@example.com"
            className={`bg-white border-100x-border-default text-black placeholder:text-gray-400 focus:border-100x-accent-primary focus:ring-1 focus:ring-100x-accent-primary h-12 ${errors.attendee_email ? 'border-red-500' : ''
              }`}
            {...register('attendee_email')}
            disabled={isSubmitting}
          />
          {errors.attendee_email && (
            <p className="text-sm text-red-500">{errors.attendee_email.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <input
            id="terms_accepted"
            type="checkbox"
            className="mt-1 w-4 h-4 accent-100x-accent-primary cursor-pointer"
            {...register('terms_accepted')}
            disabled={isSubmitting}
          />
          <Label htmlFor="terms_accepted" className="text-sm text-100x-text-secondary cursor-pointer">
            I agree to receive event updates and understand that my information will be used to contact me about this event.
          </Label>
        </div>
        {errors.terms_accepted && (
          <p className="text-sm text-red-500 -mt-2">{errors.terms_accepted.message}</p>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-950/50 border-red-900 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-transparent border-2 border-100x-accent-primary text-100x-accent-primary hover:bg-100x-accent-primary hover:text-white font-bold transition-all duration-300 hover:shadow-[0_0_25px_rgba(249,104,70,0.6)] py-6 uppercase tracking-wider"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Now'
          )}
        </Button>

        <p className="text-xs text-100x-text-muted text-center">
          Registration is free. You'll receive event details after registering.
        </p>
      </form>
    </div>
  );
}
