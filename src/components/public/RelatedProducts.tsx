"use client";

import Link from "next/link";
import { useStore } from "@/components/public/store";
import { defaultVariant } from "@/lib/variants";
import { productImage } from "@/lib/images";
import type { RelatedProduct } from "@/lib/productDetail";

/** How many of the ranked candidates the rail actually shows. */
const VISIBLE = 4;

interface RelatedProductsProps {
  /** Already ranked by the API — same category first, then tag overlap. */
  products: RelatedProduct[];
  /** Powers the "View All" link back into the shop. */
  categorySlug: string;
}

/**
 * "You May Also Like" rail below the reviews.
 *
 * Each card adds its own default variant straight to the bag, so a shopper who
 * wants a second flavor never has to leave the page they are on.
 */
export default function RelatedProducts({
  products,
  categorySlug,
}: RelatedProductsProps) {
  const { addToCart, formatPrice, localized } = useStore();

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-[#FFF9E9] border-t border-cream">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent mb-2 block">
              Handpicked For You
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
              You May Also Like
            </h2>
          </div>
          <Link
            href={`/shop?category=${encodeURIComponent(categorySlug)}`}
            className="text-xs uppercase tracking-widest font-bold text-accent hover:underline"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.slice(0, VISIBLE).map((r) => {
            const variant = defaultVariant(r.productVariant);
            const price = variant ? Number(variant.price) : 0;
            const compareAt = variant ? Number(variant.compare_at_price) : 0;
            const image = productImage(r.images);
            const soldOut = !variant || variant.stock === 0;
            const name = localized(r.name_en, r.name_th);
            return (
              <div
                key={r.id}
                className="product-card bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col"
              >
                <Link
                  href={`/product-detail/${r.slug}`}
                  className="relative block aspect-3/4 overflow-hidden bg-[#FFF9E9]"
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {r.highlights?.[0] && (
                    <span className="absolute top-4 left-4 z-10 bg-[#ECA40C] text-[#0A0A0A] text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md">
                      {r.highlights[0]}
                    </span>
                  )}
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-1.5 block">
                      {variant?.label ??
                        (r.category
                          ? localized(r.category.name_en, r.category.name_th)
                          : "Thai Mango")}
                    </span>
                    <h3 className="font-serif text-xl text-charcoal mb-2 leading-snug">
                      <Link
                        href={`/product-detail/${r.slug}`}
                        className="hover:text-accent transition"
                      >
                        {name}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-5">
                      {localized(r.description_en, r.description_th)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-cream flex items-center justify-between gap-3">
                    <div>
                      <span className="font-serif text-lg font-semibold text-charcoal">
                        {variant ? formatPrice(price) : "—"}
                      </span>
                      {compareAt > price && (
                        <span className="text-xs text-muted line-through ml-1.5">
                          {formatPrice(compareAt)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        if (!variant) return;
                        addToCart({
                          slug: r.slug,
                          name,
                          price,
                          image,
                          size: variant.label,
                          quantity: 1,
                        });
                      }}
                      className="px-4 py-2.5 bg-charcoal text-white rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-accent transition duration-300 disabled:opacity-40 disabled:hover:bg-charcoal"
                    >
                      {soldOut ? "Sold Out" : "Add to Bag"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
