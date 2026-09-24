import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { getSession } from "@/lib/session";
import { reviewVoteSchema } from "@/schemas/review.schema";

type Params = { params: Promise<{ id: string }> };

/** Cast, change or withdraw the signed-in user's "was this helpful?" vote. */
export async function POST(req: Request, { params }: Params) {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Sign in to rate reviews");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const reviewId = Number(id);
        if (!Number.isInteger(reviewId)) {
            const apiError = new ApiError(400, "Invalid review id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = reviewVoteSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid vote");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            select: { user_id: true, status: true },
        });
        if (!review || review.status !== "PUBLISHED") {
            const apiError = new ApiError(404, "Review not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        if (review.user_id === session.sub) {
            const apiError = new ApiError(403, "You can't rate your own review");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const key = { review_id_user_id: { review_id: reviewId, user_id: session.sub } };
        const { helpful } = parsed.data;
        if (helpful === null) {
            await prisma.reviewVote.deleteMany({
                where: { review_id: reviewId, user_id: session.sub },
            });
        } else {
            await prisma.reviewVote.upsert({
                where: key,
                create: { review_id: reviewId, user_id: session.sub, helpful },
                update: { helpful },
            });
        }

        const helpfulCount = await prisma.reviewVote.count({
            where: { review_id: reviewId, helpful: true },
        });

        const apiResponse = new ApiResponse(
            200,
            { helpful_count: helpfulCount, my_vote: helpful },
            "Thanks for your feedback"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Review vote failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
