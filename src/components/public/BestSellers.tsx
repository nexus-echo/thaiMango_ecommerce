"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, ShoppingBag, TrendingUp } from "lucide-react";
import { useStore } from "@/components/public/store";
import SellingFastBadge from "@/components/public/SellingFastBadge";
import { unwrap } from "@/lib/http";
import { mapProduct, type ApiProduct } from "@/lib/productCard";

/* Tailwind only emits classes it can see as complete strings, so a template
   like `md:grid-cols-${limit}` compiles to nothing. Spelled out here. */
const GRID_COLS: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
};

interface BestSellersResponse {
    products: ApiProduct[];
    /* "newest" means the store has no order history yet and the API topped the
       list up with recent products — rank badges are suppressed in that case
       so nothing claims a sales position it hasn't earned. */
    source: "sales" | "newest";
}

export default function BestSellers({
    limit = 4,
    intro,
}: {
    limit?: number;
    /** Admin-editable copy from Site Content; falls back to the line below. */
    intro?: string;
}) {
    const { localized, formatPrice, addToCart } = useStore();

    const bestSellersQuery = useQuery({
        queryKey: ["best-sellers", limit],
        queryFn: async (): Promise<BestSellersResponse> =>
            unwrap<BestSellersResponse>(
                axios.get(`/api/products/best-sellers?limit=${limit}`)
            ),
        staleTime: 5 * 60 * 1000,
    });

    const ranked = bestSellersQuery.data?.source === "sales";
    const products = (bestSellersQuery.data?.products ?? []).map((p) =>
        mapProduct(p, formatPrice, localized)
    );

    return (
        <section id="best-selling" className="py-24 bg-[#F4E4D4]">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 reveal gap-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-normal text-[#A4741C] uppercase mb-3">
                            Our Best Selling Products
                        </h2>
                        <p className="text-muted text-sm md:text-base max-w-2xl">
                            {intro ||
                                "The flavors our customers come back for — ranked by what actually leaves the orchard."}
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center px-6 py-3.5 bg-accent text-white text-[10px] md:text-xs tracking-[0.15em] uppercase hover:bg-charcoal transition duration-300 rounded-full font-bold shadow-md shrink-0"
                    >
                        Explore All Products
                        <ArrowRight className="w-4 h-4 ml-3" />
                    </Link>
                </div>

                {bestSellersQuery.isPending ? (
                    <div className={`grid grid-cols-1 ${GRID_COLS[limit] ?? "md:grid-cols-4"} gap-5`}>
                        {Array.from({ length: limit }, (_, i) => (
                            <div
                                key={i}
                                className="rounded-3xl aspect-4/5 bg-white/70 animate-pulse"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
                        No products available yet.
                    </p>
                ) : (
                    <div className={`grid grid-cols-1 ${GRID_COLS[limit] ?? "md:grid-cols-4"} gap-5`}>
                        {products.map((product, i) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm group cursor-pointer reveal"
                                style={i > 0 ? { transitionDelay: `${i * 150}ms` } : undefined}
                            >
                                <div className="relative aspect-4/5 overflow-hidden bg-[#F4E4D4]">
                                    <Link
                                        href={`/product-detail/${product.slug}`}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            width={300}
                                            height={300}
                                            quality={60}
                                            src={product.image}
                                            alt={product.name}
                                            className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105"
                                        />
                                    </Link>

                                    {/* Rank — only where the order history earned it */}
                                    {ranked && product.unitsSold > 0 && (
                                        <span className="absolute top-3 left-3 z-10 pointer-events-none inline-flex items-center gap-1.5 bg-charcoal text-ivory text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                                            <TrendingUp className="w-3 h-3" />
                                            #{i + 1} Best Seller
                                        </span>
                                    )}

                                    {product.discountPct !== undefined &&
                                        product.discountPct > 0 && (
                                            <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 pointer-events-none">
                                                {product.discountPct}%
                                            </span>
                                        )}

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addToCart({
                                                slug: product.slug,
                                                name: product.name,
                                                price: product.price,
                                                image: product.image,
                                            });
                                        }}
                                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-accent shadow-md z-10 hover:bg-accent hover:text-white transition"
                                        aria-label={`Add ${product.name} to cart`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                    </button>

                                    {/* Bottom-left keeps it clear of the rank pill above
                                        and the quick-add button opposite. */}
                                    {product.sellingFast && (
                                        <SellingFastBadge className="absolute bottom-3 left-3 z-10" />
                                    )}
                                </div>

                                <div className="px-6 py-2">
                                    <h3 className="text-sm md:text-base font-serif font-semibold uppercase tracking-tight text-[#0A0A0A] mb-2 truncate">
                                        <Link href={`/product-detail/${product.slug}`}>
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="text-[13px] text-muted line-clamp-2 mb-4 leading-relaxed">
                                        {product.desc}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-[9px] tracking-widest uppercase font-bold text-accent bg-[#F4E4D4] px-3 py-1.5 rounded-full">
                                            {product.categoryName}
                                        </span>
                                        {ranked && product.unitsSold > 0 && (
                                            <span className="text-[9px] tracking-widest uppercase font-bold text-muted">
                                                {product.unitsSold} sold
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-end justify-between py-4 border-t border-cream">
                                        <div className="flex flex-row-reverse items-center justify-center gap-3">
                                            {product.comparePriceDisplay && (
                                                <span className="block text-xs text-muted line-through">
                                                    {product.comparePriceDisplay}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold text-[#B47404]">
                                                {product.priceDisplay}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/product-detail/${product.slug}`}
                                            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-[#0A0A0A] group-hover:text-accent transition"
                                        >
                                            Explore
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
