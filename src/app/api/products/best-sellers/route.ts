import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import {
    isSellingFast,
    recentUnitsByProduct,
    stockOf,
} from "@/lib/sellingFast";

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 12;

/**
 * GET /api/products/best-sellers?limit=3
 *
 * Products ranked by units actually sold. Shape matches /api/products so the
 * same client-side mapper works, with `units_sold` added per product and a
 * top-level `source` saying whether the list is a real ranking.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(
            MAX_LIMIT,
            Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT)
        );

        /* Units sold per product. CANCELLED orders are excluded: they were
           never fulfilled, so counting them would let a cancelled bulk order
           crown a product nobody actually received. Over-fetch, because a past
           top seller may since have been archived or deleted and must not
           consume one of the slots. */
        const ranked = await prisma.orderItem.groupBy({
            by: ["product_id"],
            where: {
                product_id: { not: null },
                order: { status: { not: "CANCELLED" } },
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: limit * 4,
        });

        const rankedIds = ranked
            .map((row) => row.product_id)
            .filter((id): id is string => id !== null);
        const unitsById = new Map(
            ranked.map((row) => [row.product_id, row._sum.quantity ?? 0])
        );

        const include = {
            category: { select: { slug: true, name_en: true, name_th: true } },
            productVariant: { orderBy: { position: "asc" as const } },
        };

        const sold = rankedIds.length
            ? await prisma.product.findMany({
                where: { id: { in: rankedIds }, status: "ACTIVE" },
                include,
            })
            : [];

        /* findMany ignores the order of `in`, so restore the sales ranking. */
        sold.sort((a, b) => rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id));

        const bestSellers = sold
            .slice(0, limit)
            .map((product) => ({
                ...product,
                units_sold: unitsById.get(product.id) ?? 0,
            }));

        /* A store with no order history yet would render an empty section, so
           top up with the newest active products. `source` reports which it
           is, so the storefront can drop the rank badges and nobody debugging
           mistakes a placeholder list for a real ranking. */
        const source: "sales" | "newest" =
            bestSellers.length > 0 ? "sales" : "newest";

        if (bestSellers.length < limit) {
            const filler = await prisma.product.findMany({
                where: {
                    status: "ACTIVE",
                    id: { notIn: bestSellers.map((product) => product.id) },
                },
                orderBy: { created_at: "desc" },
                take: limit - bestSellers.length,
                include,
            });
            bestSellers.push(
                ...filler.map((product) => ({ ...product, units_sold: 0 }))
            );
        }

        /* Velocity is a separate question from lifetime rank: a product can be
           the all-time #1 and no longer be moving, so the badge is decided on
           the trailing window, not on `units_sold`. */
        const recentUnits = await recentUnitsByProduct(
            bestSellers.map((product) => product.id)
        );
        const products = bestSellers.map((product) => {
            const recent = recentUnits.get(product.id) ?? 0;
            return {
                ...product,
                units_sold_recent: recent,
                selling_fast: isSellingFast(recent, stockOf(product.productVariant)),
            };
        });

        const apiResponse = new ApiResponse(
            200,
            { products, source },
            "Best sellers fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching best sellers failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
