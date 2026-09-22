import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import {
    isSellingFast,
    recentUnitsByProduct,
    stockOf,
} from "@/lib/sellingFast";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get("category") ?? undefined;
        const search = searchParams.get("search")?.trim() || undefined;
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));

        const where: Prisma.ProductWhereInput = {
            status: "ACTIVE",
            ...(categorySlug ? { category: { slug: categorySlug } } : {}),
            ...(search
                ? {
                    OR: [
                        { name_en: { contains: search, mode: "insensitive" } },
                        { name_th: { contains: search, mode: "insensitive" } },
                        { tags: { has: search } },
                    ],
                }
                : {}),
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    category: { select: { slug: true, name_en: true, name_th: true } },
                    productVariant: { orderBy: { position: "asc" } },
                },
            }),
            prisma.product.count({ where }),
        ]);

        /* Same demand signal the best-sellers route attaches, so every grid on
           the storefront badges a product identically (see lib/sellingFast). */
        const recentUnits = await recentUnitsByProduct(products.map((p) => p.id));
        const withVelocity = products.map((product) => {
            const recent = recentUnits.get(product.id) ?? 0;
            return {
                ...product,
                units_sold_recent: recent,
                selling_fast: isSellingFast(recent, stockOf(product.productVariant)),
            };
        });

        const apiResponse = new ApiResponse(
            200,
            {
                products: withVelocity,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
            "Products fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching products failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
