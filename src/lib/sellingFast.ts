import { prisma } from "@/lib/prismaClient";

/**
 * SERVER ONLY — imports the Prisma client. Route handlers are the only
 * intended consumers; a client component importing this would pull the
 * database client into the browser bundle.
 *
 * "Selling fast" is a claim about demand shown to shoppers, so the rule lives
 * here rather than in each card: one definition, one place to tune it, and no
 * chance of two grids disagreeing about the same product.
 */

/** Trailing window the velocity is measured over. */
export const SELLING_FAST_WINDOW_DAYS = 30;

/** Units inside the window that qualify a product on demand alone. */
export const SELLING_FAST_MIN_UNITS = 3;

/**
 * At or below this combined stock, any recent demand qualifies. This is the
 * scarcity half of the badge: a product with two left and buyers still taking
 * them is genuinely about to run out.
 */
export const SELLING_FAST_LOW_STOCK = 10;

/**
 * Both halves require at least one recent sale, so nothing is ever badged on
 * low stock alone — a product that simply was never restocked is not selling
 * fast, and saying so would be a false urgency claim.
 */
export function isSellingFast(recentUnits: number, stock: number): boolean {
    if (recentUnits <= 0) return false;
    if (recentUnits >= SELLING_FAST_MIN_UNITS) return true;
    return stock > 0 && stock <= SELLING_FAST_LOW_STOCK;
}

/** Units sold per product inside the trailing window, CANCELLED excluded. */
export async function recentUnitsByProduct(
    productIds: string[]
): Promise<Map<string, number>> {
    if (productIds.length === 0) return new Map();

    const since = new Date();
    since.setDate(since.getDate() - SELLING_FAST_WINDOW_DAYS);

    const rows = await prisma.orderItem.groupBy({
        by: ["product_id"],
        where: {
            product_id: { in: productIds },
            order: {
                status: { not: "CANCELLED" },
                created_at: { gte: since },
            },
        },
        _sum: { quantity: true },
    });

    return new Map(
        rows
            .filter((row): row is typeof row & { product_id: string } =>
                row.product_id !== null
            )
            .map((row) => [row.product_id, row._sum.quantity ?? 0])
    );
}

/** Combined stock across a product's variants. */
export function stockOf(variants: { stock: number }[] | null | undefined): number {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + v.stock, 0);
}
