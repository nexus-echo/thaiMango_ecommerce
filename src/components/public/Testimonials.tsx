"use client";

import { useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useStore } from "@/components/public/store";
import Stars from "@/components/public/Stars";
import TestimonialImage from "@/components/common/TestimonialImage";
import { unwrap } from "@/lib/http";

interface PublicTestimonial {
    id: number;
    name: string;
    location: string;
    quote: string;
    rating: number;
    image: string | null;
    /* Picked from a real customer review (Admin → Testimonials). */
    verified: boolean;
    product: { slug: string; name_en: string; name_th: string } | null;
}

/**
 * Admin-curated customer quotes (Admin → Testimonials). Renders nothing when
 * there are none, so the homepage never shows an empty "what people say".
 */
export default function Testimonials() {
    const { t, localized } = useStore();
    const trackRef = useRef<HTMLDivElement>(null);

    const testimonialsQuery = useQuery({
        queryKey: ["testimonials"],
        queryFn: () => unwrap<PublicTestimonial[]>(axios.get("/api/testimonials")),
        staleTime: 5 * 60 * 1000,
    });

    const testimonials = testimonialsQuery.data ?? [];
    if (testimonialsQuery.isError || (testimonialsQuery.isSuccess && testimonials.length === 0)) {
        return null;
    }

    /* One "page" of cards at a time; the track snaps so it lands cleanly. */
    const scroll = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (track) track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
    };

    const scrollable = testimonials.length > 1;

    return (
        <section id="testimonials" className="py-20 md:py-24 bg-ivory">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 reveal">
                    <div>
                        <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-bold block mb-3">
                            {t("testimonials_eyebrow")}
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
                            {t("testimonials_title")}
                        </h2>
                    </div>
                    {scrollable && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => scroll(-1)}
                                aria-label="Previous testimonials"
                                className="w-11 h-11 rounded-full border border-charcoal/20 text-charcoal flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll(1)}
                                aria-label="Next testimonials"
                                className="w-11 h-11 rounded-full border border-charcoal/20 text-charcoal flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {testimonialsQuery.isPending ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`rounded-4xl h-72 bg-cream/60 animate-pulse ${
                                    i === 1 ? "hidden md:block" : i === 2 ? "hidden lg:block" : ""
                                }`}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        ref={trackRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth -mx-6 px-6 md:mx-0 md:px-0"
                    >
                        {testimonials.map((item) => {
                            const productName = item.product
                                ? localized(item.product.name_en, item.product.name_th)
                                : null;
                            return (
                                <figure
                                    key={item.id}
                                    className="snap-start shrink-0 w-[85%] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] bg-white rounded-4xl border border-cream p-8 flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <Stars n={item.rating} />
                                        <Quote className="w-8 h-8 text-mango/40 fill-mango/15" aria-hidden />
                                    </div>
                                    <span className="sr-only">Rated {item.rating} out of 5</span>

                                    <blockquote className="flex-1 text-charcoal/85 text-[15px] leading-relaxed mb-8">
                                        &ldquo;{item.quote}&rdquo;
                                    </blockquote>

                                    <figcaption className="flex items-center gap-4 pt-6 border-t border-cream">
                                        <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-cream ring-2 ring-mango/40 ring-offset-2 ring-offset-white">
                                            <TestimonialImage
                                                src={item.image}
                                                alt={item.name}
                                                sizes="56px"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-charcoal truncate">
                                                {item.name}
                                            </p>
                                            {item.location && (
                                                <p className="text-xs text-muted truncate">
                                                    {item.location}
                                                </p>
                                            )}
                                            {item.verified && (
                                                <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-beetroot">
                                                    <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">
                                                        {t("testimonials_verified")}
                                                        {item.product && productName && (
                                                            <>
                                                                {" · "}
                                                                <Link
                                                                    href={`/product-detail/${item.product.slug}`}
                                                                    className="underline-offset-2 hover:underline"
                                                                >
                                                                    {productName}
                                                                </Link>
                                                            </>
                                                        )}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </figcaption>
                                </figure>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
