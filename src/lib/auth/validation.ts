import { z } from "zod";
import { normalizePhoneNumber } from "@/lib/auth/phone-number";

const optionalPhone = z
  .string()
  .trim()
  .max(25, "Phone number must be 25 characters or fewer.")
  .optional()
  .transform((value) => value?.trim() || null)
  .refine(
    (value) => value === null || normalizePhoneNumber(value) !== null,
    "Enter a valid phone number with its country code, such as +91 9876543210."
  )
  .transform((value) => (value ? normalizePhoneNumber(value) : null));

const optionalLocation = z
  .string()
  .trim()
  .max(160, "Location must be 160 characters or fewer.")
  .optional()
  .transform((value) => value || null);

export const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(320),
  password: z.string().min(1).max(128),
});

export const registrationSchema = credentialsSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(120, "Name must be 120 characters or fewer."),
  password: z
    .string()
    .min(6, "Password must contain at least 6 characters.")
    .max(128, "Password must be 128 characters or fewer."),
  phone: optionalPhone,
  role: z.literal("FARMER").optional(),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(120, "Name must be 120 characters or fewer."),
  phone: optionalPhone,
  location: optionalLocation,
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
