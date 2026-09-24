import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { testimonialSchema } from "@/schemas/testimonial.schema";
import { isAllowedImageSrc } from "@/lib/s3";
import { testimonialAdminInclude } from "@/lib/testimonials";

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const testimonials = await prisma.testimonial.findMany({
            orderBy: [{ position: "asc" }, { created_at: "desc" }],
            include: testimonialAdminInclude,
        });

        const apiResponse = new ApiResponse(200, testimonials, "Testimonials fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin testimonials fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function POST(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = testimonialSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        if (parsed.data.image && !isAllowedImageSrc(parsed.data.image)) {
            const apiError = new ApiError(400, "Image must be a site path or an upload in our S3 bucket");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const reviewId = parsed.data.review_id ?? null;
        if (reviewId !== null) {
            const review = await prisma.review.findUnique({
                where: { id: reviewId },
                select: { id: true, testimonial: { select: { id: true } } },
            });
            if (!review) {
                const apiError = new ApiError(404, "That review no longer exists");
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
            if (review.testimonial) {
                const apiError = new ApiError(409, "This review is already a testimonial");
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                name: parsed.data.name,
                location: parsed.data.location,
                quote: parsed.data.quote,
                rating: parsed.data.rating,
                image: parsed.data.image ?? null,
                review_id: reviewId,
                position: parsed.data.position,
                is_active: parsed.data.is_active,
            },
            include: testimonialAdminInclude,
        });

        const apiResponse = new ApiResponse(201, testimonial, "Testimonial created successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin testimonial create failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
