import { z } from "zod";

/** "+66 81-234 5678" → "+66812345678"; null when it can't be a real E.164 number. */
export function toE164(phone: string): string | null {
    const compact = phone.replace(/[\s\-().]/g, "");
    return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
}

const phone = z
    .string()
    .trim()
    .refine((v) => toE164(v) !== null, "Enter your WhatsApp number with its country code");

export const whatsappSendSchema = z.object({ phone });

/** Asked only when the number isn't linked to an account yet. */
export const whatsappProfileSchema = z.object({
    f_name: z.string().trim().min(1, "First name is required"),
    l_name: z.string().trim(),
    email: z.union([z.email("Enter a valid email address"), z.literal("")]),
});

export const whatsappVerifySchema = z.object({
    phone,
    code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
    profile: whatsappProfileSchema.optional(),
});
