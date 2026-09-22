"use client";

import { useState } from "react";
import { ChevronDown, Droplet, ShieldCheck, Sparkles } from "lucide-react";
import { useStore } from "@/components/public/store";
import Stars from "@/components/public/Stars";
import { defaultVariant } from "@/lib/variants";
import type { DetailProduct } from "@/lib/productDetail";

/* Icons cycled across the key-benefit grid, mirroring the static design. */
const HIGHLIGHT_ICONS = [Droplet, ShieldCheck, Sparkles];

/* The three promises the pack itself makes, shown under the CTA. */
const KEY_BENEFITS = ["100% Natural", "No Preservatives", "Naturally Sweet"];

/** Below this, the stock line switches from silent to "only n left". */
const LOW_STOCK_THRESHOLD = 20;

interface ProductBuyBoxProps {
  product: DetailProduct;
  /** The photo currently showing in the gallery — carried onto the cart line. */
  image: string;
}

/**
 * Everything to the right of the gallery: title, rating, price, size picker,
 * quantity, add-to-bag, wishlist, and the detail accordions.
 *
 * Owns the two pieces of purchase state (which variant, how many) because
 * nothing outside this column reads them — the page only needs to hand it the
 * image to attach to the cart line.
 */
export default function ProductBuyBox({ product, image }: ProductBuyBoxProps) {
  const {
    addToCart,
    isWishlisted,
    toggleWishlist,
    formatPrice,
    freeShippingThreshold,
    localized,
  } = useStore();

  const [variantId, setVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);

  const variants = product.productVariant;
  /* No initialising effect: until something is picked, the default variant is
     the selection. `defaultVariant` already falls back to the first one. */
  const selectedVariant =
    variants.find((v) => v.id === variantId) ?? defaultVariant(variants);

  const name = localized(product.name_en, product.name_th);
  const price = selectedVariant ? Number(selectedVariant.price) : 0;
  const compareAt = selectedVariant ? Number(selectedVariant.compare_at_price) : 0;
  const savePct =
    compareAt > price && compareAt > 0
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : 0;
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const wishlisted = isWishlisted(product.slug);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      slug: product.slug,
      name,
      price: Number(selectedVariant.price),
      image,
      size: selectedVariant.label,
      quantity: qty,
    });
  };

  return (
    <div className="lg:col-span-6 flex flex-col justify-start">
      <div className="border-b border-cream pb-6 mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2 block">
          {product.highlights.length > 0
            ? product.highlights.slice(0, 2).join(" • ")
            : localized(product.category.name_en, product.category.name_th)}
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-4 leading-tight">
          {name}
        </h1>

        {/* Rating & Reviews */}
        {product.ratingCount > 0 ? (
          <div className="flex items-center gap-3 mb-4">
            <Stars n={product.ratingAverage ?? 0} />
            <span className="text-xs font-semibold text-charcoal">
              {product.ratingAverage?.toFixed(1)} / 5.0
            </span>
            <span className="text-xs text-muted">
              ({product.ratingCount} Verified Review
              {product.ratingCount === 1 ? "" : "s"})
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted mb-4">No reviews yet</p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">
            {formatPrice(price)}
          </span>
          {compareAt > price && (
            <span className="text-sm text-muted line-through">
              {formatPrice(compareAt)}
            </span>
          )}
          {savePct > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Save {savePct}%
            </span>
          )}
          {!inStock && (
            <span className="text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <p className="text-sm md:text-base text-muted leading-relaxed mb-8">
        {localized(product.description_en, product.description_th)}
      </p>

      {/* Variant Selector */}
      {variants.length > 0 && (
        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest font-bold text-charcoal mb-3 block">
            Select Size:
          </span>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => {
              const active = v.id === selectedVariant?.id;
              const soldOut = v.stock === 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className={
                    active
                      ? "size-btn px-5 py-3 rounded-full border-2 border-charcoal bg-charcoal text-white text-xs font-bold uppercase tracking-wider"
                      : `size-btn px-5 py-3 rounded-full border border-cream bg-white text-xs font-bold uppercase tracking-wider transition ${
                          soldOut
                            ? "text-muted/50 line-through"
                            : "text-muted hover:border-charcoal hover:text-charcoal"
                        }`
                  }
                >
                  {v.label} · {formatPrice(Number(v.price))}
                </button>
              );
            })}
          </div>
          {selectedVariant &&
            inStock &&
            selectedVariant.stock < LOW_STOCK_THRESHOLD && (
              <p className="text-[11px] text-amber-600 font-semibold mt-2">
                Only {selectedVariant.stock} left in stock
              </p>
            )}
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Counter */}
        <div className="flex items-center justify-between border border-cream bg-white rounded-full px-4 py-3 w-full sm:w-36">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="text-muted hover:text-charcoal p-1 text-lg font-bold"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="qty-input text-sm font-bold text-charcoal">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(selectedVariant?.stock ?? 1, q + 1))}
            className="text-muted hover:text-charcoal p-1 text-lg font-bold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="add-to-cart flex-1 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent transition duration-300 shadow-md disabled:opacity-40 disabled:hover:bg-charcoal"
        >
          {inStock ? `Add to Bag • ${formatPrice(price * qty)}` : "Out of Stock"}
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(product.slug, name)}
          className={`px-5 py-4 rounded-full border text-xs font-bold uppercase tracking-widest transition ${
            wishlisted
              ? "border-rose-300 bg-rose-50 text-rose-600"
              : "border-cream bg-white text-muted hover:border-charcoal hover:text-charcoal"
          }`}
        >
          {wishlisted ? "Saved" : "Save"}
        </button>
      </div>

      {/* Key Benefits Icons */}
      {product.highlights.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-6 bg-cream/40 rounded-2xl border border-cream mb-8">
          {KEY_BENEFITS.map((h, idx) => {
            const Icon = HIGHLIGHT_ICONS[idx];
            return (
              <div key={h} className="flex flex-col items-center text-center">
                <Icon className="w-6 h-6 text-accent mb-2" />
                <span className="text-[11px] font-bold text-charcoal uppercase leading-snug">
                  {h}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Accordion Details */}
      <div className="border-t border-cream divide-y divide-cream">
        {product.how_its_made && (
          <details className="py-4 group" open>
            <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none cursor-pointer">
              <span>How It&apos;s Made</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6 whitespace-pre-line">
              {product.how_its_made}
            </p>
          </details>
        )}

        {product.storage_info && (
          <details className="py-4 group">
            <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none cursor-pointer">
              <span>Storage &amp; Freshness</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6 whitespace-pre-line">
              {product.storage_info}
            </p>
          </details>
        )}

        {product.ingredients && (
          <details className="py-4 group">
            <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none cursor-pointer">
              <span>Full Ingredients</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6 whitespace-pre-line">
              {product.ingredients}
            </p>
          </details>
        )}

        <details className="py-4 group">
          <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none cursor-pointer">
            <span>Shipping &amp; Free Returns</span>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>
          <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6">
            Complimentary express delivery on orders over{" "}
            {formatPrice(freeShippingThreshold)}. Standard delivery delivers in
            2–4 business days with tamper-proof eco packaging.
          </p>
        </details>
      </div>
    </div>
  );
}
