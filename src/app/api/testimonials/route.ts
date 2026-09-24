import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";

/* Public: only testimonials the admin has switched on, in their chosen order.
   `verified` marks ones picked from a real customer review, without exposing
   the review or the customer's account. */
export async function GET() {
    try {
        const rows = await prisma.testimonial.findMany({
            where: { is_active: true },
            orderBy: [{ position: "asc" }, { created_at: "desc" }],
            select: {
                id: true,
                name: true,
                location: true,
                quote: true,
                rating: true,
                image: true,
                review: {
                    select: {
                        product: { select: { slug: true, name_en: true, name_th: true } },
                    },
                },
            },
        });

        const testimonials = rows.map(({ review, ...t }) => ({
            ...t,
            verified: review !== null,
            product: review?.product ?? null,
        }));

        const apiResponse = new ApiResponse(200, testimonials, "Testimonials fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching testimonials failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
