import { z } from "zod";

export const REVIEW_MAX_LENGTH = 500;

/* What a customer submits from the product page. */
export const reviewSubmitSchema = z.object({
    rating: z.number().int().min(1, "Pick a star rating").max(5),
    text: z
        .string()
        .trim()
        .min(10, "Tell us a little more — at least 10 characters")
        .max(REVIEW_MAX_LENGTH, `Keep it under ${REVIEW_MAX_LENGTH} characters`),
});

export type ReviewSubmitValues = z.infer<typeof reviewSubmitSchema>;

/* true = helpful, false = not helpful, null = take my vote back. */
export const reviewVoteSchema = z.object({
    helpful: z.boolean().nullable(),
});
