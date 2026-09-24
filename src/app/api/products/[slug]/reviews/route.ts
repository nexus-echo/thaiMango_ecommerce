import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { getSession } from "@/lib/session";
import { hasPurchased } from "@/lib/purchases";
import { reviewSubmitSchema } from "@/schemas/review.schema";

type Params = { params: Promise<{ slug: string }> };

const MY_REVIEW_SELECT = {
    id: true,
    rating: true,
    text: true,
    status: true,
    created_at: true,
} as const;

const PRODUCT_SELECT = { id: true, name_en: true, name_th: true } as const;

/**
 * The viewer's review state for this product: their own review (any status)
 * and whether they may write one — only customers who bought it can.
 */
export async function GET(_req: Request, { params }: Params) {
    try {
        const session = await getSession();
        if (!session) {
            const apiResponse = new ApiResponse(
                200,
                { review: null, purchased: false },
                "Not signed in"
            );
            return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
        }

        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug },
            select: PRODUCT_SELECT,
        });
        if (!product) {
            const apiError = new ApiError(404, "Product not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const [review, purchased] = await Promise.all([
            prisma.review.findFirst({
                where: { user_id: session.sub, product_id: product.id },
                orderBy: { created_at: "desc" },
                select: MY_REVIEW_SELECT,
            }),
            session.role === "CUSTOMER"
                ? hasPurchased(session.sub, product)
                : Promise.resolve(false),
        ]);

        const apiResponse = new ApiResponse(
            200,
            { review, purchased },
            "Review fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching own review failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

/**
 * Write or edit the customer's review. Only customers with a (non-cancelled)
 * order for this product may post. One review per customer per product —
 * posting again edits it. Every write goes back to PENDING, so an edit can't
 * slip past moderation by piggybacking on an already-approved review.
 */
export async function POST(req: Request, { params }: Params) {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Sign in to write a review");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        if (session.role !== "CUSTOMER") {
            const apiError = new ApiError(403, "Only customer accounts can write reviews");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = reviewSubmitSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.values(fieldErrors).flatMap((messages) => messages ?? []);
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug, status: "ACTIVE" },
            select: PRODUCT_SELECT,
        });
        if (!product) {
            const apiError = new ApiError(404, "Product not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Verified buyers only — checked here, not just hidden in the UI. */
        if (!(await hasPurchased(session.sub, product))) {
            const apiError = new ApiError(
                403,
                "Only customers who've bought this product can review it"
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const existing = await prisma.review.findFirst({
            where: { user_id: session.sub, product_id: product.id },
            orderBy: { created_at: "desc" },
            select: { id: true },
        });

        const data = {
            rating: parsed.data.rating,
            text: parsed.data.text,
            status: "PENDING" as const,
        };

        const review = existing
            ? await prisma.review.update({
                  where: { id: existing.id },
                  data,
                  select: MY_REVIEW_SELECT,
              })
            : await prisma.review.create({
                  data: { ...data, product_id: product.id, user_id: session.sub },
                  select: MY_REVIEW_SELECT,
              });

        const apiResponse = new ApiResponse(
            existing ? 200 : 201,
            review,
            "Thanks! Your review will appear once it's approved."
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Submitting review failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
