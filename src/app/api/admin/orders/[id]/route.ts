import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";

const orderPatchSchema = z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        created_at: true,
                    },
                },
                items: {
                    orderBy: { id: "asc" },
                    /* The product is kept only to deep-link the catalog and show a
                       thumbnail — the line's own name/variant/price are what was sold. */
                    include: { product: { select: { slug: true, images: true } } },
                },
            },
        });
        if (!order) {
            const apiError = new ApiError(404, "Order not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Lifetime orders for this shopper, so the page can tell a first-time
           buyer from a returning one. */
        const orderCount = await prisma.order.count({
            where: { user_id: order.user_id },
        });

        const apiResponse = new ApiResponse(
            200,
            { ...order, user: { ...order.user, order_count: orderCount } },
            "Order fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin order fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const body = await req.json();
        const parsed = orderPatchSchema.safeParse(body);
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid order status");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status: parsed.data.status },
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { items: true } },
            },
        });

        const apiResponse = new ApiResponse(200, order, "Order updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin order update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
