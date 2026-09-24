import { z } from "zod";

export const testimonialSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(80, "Keep the name under 80 characters"),
    location: z.string().trim().max(80, "Keep this under 80 characters"),
    quote: z
        .string()
        .trim()
        .min(10, "Quote should be at least 10 characters")
        .max(600, "Keep the quote under 600 characters"),
    rating: z.number().int().min(1, "Pick a rating").max(5),
    /* Same rule as categories: a site path or an https URL. The API routes
       also require https URLs to be in our S3 bucket. Null → default image. */
    image: z
        .string()
        .trim()
        .regex(
            /^(\/(?!\/)|https:\/\/)\S*$/,
            "Image must be a site path starting with / or an https URL"
        )
        .nullable()
        .optional(),
    /* Set when the testimonial was picked from a customer review. */
    review_id: z.number().int().positive().nullable().optional(),
    position: z.number().int().min(0, "Position can't be negative"),
    is_active: z.boolean(),
});

export type TestimonialValues = z.infer<typeof testimonialSchema>;
