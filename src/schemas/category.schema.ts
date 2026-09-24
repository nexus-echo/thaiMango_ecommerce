import { z } from "zod";

export const categorySchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
    name_en: z.string().trim().min(1, "English name is required"),
    name_th: z.string().trim().min(1, "Thai name is required"),
    /* A site path ("/images/x.jpg") or an https URL. The API routes also
       require https URLs to be in our S3 bucket — the storefront renders them
       with next/image, which only allows the S3 host from next.config. */
    image: z
        .string()
        .trim()
        .regex(
            /^(\/(?!\/)|https:\/\/)\S*$/,
            "Image must be a site path starting with / or an https URL"
        )
        .nullable()
        .optional(),
    cat_id: z.number().int().positive().nullable().optional(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
