import { defaultVariant, minPrice } from "@/lib/variants";
import { productImage } from "@/lib/images";

/** A variant as the product APIs serialise it (Decimals come back as strings). */
export interface ApiVariant {
    label: string;
    weight_grams: number;
    price: string;
    compare_at_price: string;
    stock: number;
    is_default: boolean;
}

/** A product as `/api/products` and `/api/products/best-sellers` return it. */
export interface ApiProduct {
    id: string;
    slug: string;
    name_en: string;
    name_th: string;
    description_en: string;
    description_th: string;
    images: string[];
    highlights: string[];
    category: { slug: string; name_en: string; name_th: string };
    productVariant: ApiVariant[];
    /** Only present on the best-sellers route. */
    units_sold?: number;
    /** Demand signal attached by the product routes — see lib/sellingFast. */
    units_sold_recent?: number;
    selling_fast?: boolean;
}

export type PriceFormatter = (value: number) => string;
export type Localizer = (en: string, th?: string | null) => string;

/** Everything a product card renders, already localised and priced. */
export interface CardProduct {
    id: string;
    slug: string;
    name: string;
    desc: string;
    image: string;
    categorySlug: string;
    categoryName: string;
    badges: string[];
    price: number;
    priceDisplay: string;
    comparePriceDisplay?: string;
    discountPct?: number;
    unitsSold: number;
    unitsSoldRecent: number;
    sellingFast: boolean;
}

/**
 * Shared by every product card on the storefront so pricing rules ("from X"
 * vs a discount) can never drift between two sections showing the same
 * product.
 */
export function mapProduct(
    p: ApiProduct,
    formatPrice: PriceFormatter,
    localized: Localizer
): CardProduct {
    /* Cards show the default variant; "from <price>" when cheaper sizes exist. */
    const variant = defaultVariant(p.productVariant);
    const lowest = minPrice(p.productVariant);
    const price = variant ? Number(variant.price) : 0;
    const compareAt = variant ? Number(variant.compare_at_price) : 0;
    const hasCheaper = lowest !== null && lowest < price;
    const hasDiscount = variant !== null && !hasCheaper && compareAt > price;
    return {
        id: p.id,
        slug: p.slug,
        name: localized(p.name_en, p.name_th),
        desc: localized(p.description_en, p.description_th),
        image: productImage(p.images),
        categorySlug: p.category.slug,
        categoryName: localized(p.category.name_en, p.category.name_th),
        badges: p.highlights.slice(0, 2),
        price: hasCheaper ? lowest : price,
        priceDisplay: !variant
            ? "—"
            : hasCheaper
                ? `From ${formatPrice(lowest)}`
                : formatPrice(price),
        comparePriceDisplay: hasDiscount ? formatPrice(compareAt) : undefined,
        discountPct: hasDiscount
            ? Math.round(((compareAt - price) / compareAt) * 100)
            : undefined,
        unitsSold: p.units_sold ?? 0,
        unitsSoldRecent: p.units_sold_recent ?? 0,
        sellingFast: p.selling_fast ?? false,
    };
}
