import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "agriculture_officer", "farmer"]);

export const SupportedLanguageSchema = z.enum(["en", "kn", "hi", "te", "ta", "ml"]);

export const UserProfileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: UserRoleSchema,
});
