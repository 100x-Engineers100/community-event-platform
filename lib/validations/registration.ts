import { z } from 'zod';

/**
 * Registration form validation schema
 * Used for client-side and server-side validation
 */
export const registrationSchema = z.object({
  attendee_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  attendee_email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  whatsapp_number: z
    .string()
    .min(10, 'WhatsApp number must be at least 10 digits')
    .max(15, 'WhatsApp number must be less than 15 digits')
    .regex(/^\+?[0-9\s-]{10,15}$/, 'Please enter a valid phone number')
    .trim(),

  // Optional: Terms acceptance (not stored in DB, just for UX)
  terms_accepted: z
    .boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms to register'
    })
    .optional()
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Server-side registration schema (without terms_accepted)
 * This is what gets inserted into the database
 */
export const registrationDBSchema = registrationSchema.pick({
  attendee_name: true,
  attendee_email: true,
  whatsapp_number: true
});

export type RegistrationDBData = z.infer<typeof registrationDBSchema>;
