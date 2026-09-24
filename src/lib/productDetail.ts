/**
 * The shapes `/api/products/[slug]` returns, shared by the product page and
 * every component it composes.
 *
 * Separate from lib/productCard's ApiProduct: a card needs a name, an image
 * and a price, while the detail route also returns the long-form fields,
 * published reviews and the ranked related list. Merging them would force
 * every card grid to carry fields it never reads.
 *
 * Decimals arrive as strings — Prisma serialises them that way over JSON.
 */

export interface DetailVariant {
    id: number;
    label: string;
    weight_grams: number;
    sku: string;
    price: string;
    compare_at_price: string;
    stock: number;
    is_default: boolean;
}

export interface DetailReview {
    id: number;
    rating: number;
    text: string;
    created_at: string;
    user: { name: string };
    /** People who answered "Yes" to "Did you find this helpful?". */
    helpful_count: number;
    /** Written by the signed-in viewer (they can't vote on their own). */
    is_mine: boolean;
    /** The viewer's own vote: true / false, or null for none (or a guest). */
    my_vote: boolean | null;
}

export interface RelatedProduct {
    id: string;
    slug: string;
    name_en: string;
    name_th: string;
    description_en: string;
    description_th: string;
    images: string[];
    highlights: string[];
    category: { slug: string; name_en: string; name_th: string } | null;
    productVariant: DetailVariant[];
}

export interface DetailProduct {
    id: string;
    slug: string;
    name_en: string;
    name_th: string;
    description_en: string;
    description_th: string;
    images: string[];
    tags: string[];
    highlights: string[];
    how_its_made: string | null;
    storage_info: string | null;
    ingredients: string | null;
    category: { slug: string; name_en: string; name_th: string };
    productVariant: DetailVariant[];
    reviews: DetailReview[];
    ratingAverage: number | null;
    ratingCount: number;
    relatedProducts: RelatedProduct[];
}
