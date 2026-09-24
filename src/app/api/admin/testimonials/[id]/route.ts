import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { testimonialSchema } from "@/schemas/testimonial.schema";
import { isAllowedImageSrc } from "@/lib/s3";
import { testimonialAdminInclude } from "@/lib/testimonials";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const testimonialId = Number(id);
        if (!Number.isInteger(testimonialId)) {
            const apiError = new ApiError(400, "Invalid testimonial id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = testimonialSchema.partial().safeParse(body);
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

        const existing = await prisma.testimonial.findUnique({ where: { id: testimonialId } });
        if (!existing) {
            const apiError = new ApiError(404, "Testimonial not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const reviewId = parsed.data.review_id;
        if (reviewId != null && reviewId !== existing.review_id) {
            const taken = await prisma.testimonial.findUnique({ where: { review_id: reviewId } });
            if (taken) {
                const apiError = new ApiError(409, "This review is already a testimonial");
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
        }

        const testimonial = await prisma.testimonial.update({
            where: { id: testimonialId },
            data: parsed.data,
            include: testimonialAdminInclude,
        });

        const apiResponse = new ApiResponse(200, testimonial, "Testimonial updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin testimonial update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const testimonialId = Number(id);
        if (!Number.isInteger(testimonialId)) {
            const apiError = new ApiError(400, "Invalid testimonial id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Only the testimonial goes — the source review (if any) is untouched. */
        await prisma.testimonial.delete({ where: { id: testimonialId } });

        const apiResponse = new ApiResponse(200, null, "Testimonial deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin testimonial delete failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
