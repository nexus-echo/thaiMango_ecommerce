import { prisma } from "@/lib/prismaClient";

/* Which orders count as "bought it" for reviewing. Any order that wasn't
   cancelled — narrow to ["DELIVERED"] to only allow reviews after delivery. */
const QUALIFYING_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

/**
 * True when the user has a qualifying order containing this product. Lines
 * are matched by product id; lines whose product link was lost (product
 * deleted then recreated, very old carts) fall back to the product's name.
 */
export async function hasPurchased(
    userId: string,
    product: { id: string; name_en: string; name_th: string }
): Promise<boolean> {
    const line = await prisma.orderItem.findFirst({
        where: {
            order: { user_id: userId, status: { in: [...QUALIFYING_STATUSES] } },
            OR: [
                { product_id: product.id },
                { product_id: null, name: { in: [product.name_en, product.name_th] } },
            ],
        },
        select: { id: true },
    });
    return line !== null;
}
