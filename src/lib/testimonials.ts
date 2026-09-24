/* The source review (when there is one) so the admin list can say where a
   testimonial came from. Shared by the admin testimonial routes. */
export const testimonialAdminInclude = {
    review: {
        select: {
            id: true,
            rating: true,
            user: { select: { name: true } },
            product: { select: { name_en: true, slug: true } },
        },
    },
} as const;
