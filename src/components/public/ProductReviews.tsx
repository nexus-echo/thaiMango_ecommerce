"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Stars from "@/components/public/Stars";
import type { DetailReview } from "@/lib/productDetail";

interface ProductReviewsProps {
  reviews: DetailReview[];
  average: number | null;
  count: number;
  productName: string;
}

type SortKey = "recent" | "highest" | "lowest";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Most recent" },
  { key: "highest", label: "Highest rated" },
  { key: "lowest", label: "Lowest rated" },
];

const PAGE_SIZE = 6;

/* Deterministic between server and client — Intl's default locale is not. */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/**
 * "Customer Reviews" — the published reviews for this product, with the
 * breakdown shoppers scan before they read any of the text.
 *
 * The distribution bars double as the rating filter: showing a count and then
 * making it unclickable is the thing people try first and it not working reads
 * as broken. Only PUBLISHED reviews ever reach here (see /api/products/[slug]).
 */
export default function ProductReviews({
  reviews,
  average,
  count,
  productName,
}: ProductReviewsProps) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  /* How many reviews sit at each star value, 5 down to 1. */
  const distribution = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      total: reviews.filter((r) => Math.round(r.rating) === stars).length,
    }));
    return buckets;
  }, [reviews]);

  const shown = useMemo(() => {
    const filtered =
      ratingFilter === null
        ? reviews
        : reviews.filter((r) => Math.round(r.rating) === ratingFilter);
    const sorted = [...filtered];
    if (sort === "recent") {
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "highest") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else {
      sorted.sort((a, b) => a.rating - b.rating);
    }
    return sorted;
  }, [reviews, ratingFilter, sort]);

  const toggleExpanded = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const selectRating = (stars: number | null) => {
    setRatingFilter(stars);
    setVisible(PAGE_SIZE);
  };

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <div className="reveal mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-accent/50" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
              Real people, real reviews
            </span>
            <span className="h-px w-10 bg-accent/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium leading-[1.1] tracking-[-0.02em] text-charcoal">
            Customer Reviews
          </h2>
        </div>

        {count === 0 ? (
          /* No reviews yet — say so plainly rather than hiding the section */
          <div className="reveal mx-auto max-w-2xl rounded-[32px] border border-cream bg-ivory px-8 py-14 text-center">
            <Stars n={0} className="mb-4 justify-center" />
            <h3 className="mb-2 font-serif text-2xl text-charcoal">
              No reviews yet
            </h3>
            <p className="mx-auto mb-7 max-w-md text-sm leading-relaxed text-muted">
              {productName} hasn&apos;t been reviewed on the site yet. Order a
              pouch and tell us what you think — we publish the ones we get,
              good and bad.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-charcoal/20 px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal transition duration-300 hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            >
              Send us your feedback
            </Link>
          </div>
        ) : (
          <>
            {/* Summary: score, breakdown, provenance note */}
            <div className="reveal mb-10 overflow-hidden rounded-[32px] border border-cream bg-ivory shadow-sm">
              <div className="grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,0.8fr)]">
                {/* Score */}
                <div className="flex flex-col items-center justify-center gap-2 border-b border-cream px-8 py-10 text-center lg:border-b-0 lg:border-r">
                  <span className="font-serif text-[4rem] leading-none tracking-[-0.03em] text-charcoal md:text-[4.5rem]">
                    {(average ?? 0).toFixed(1)}
                  </span>
                  <Stars n={average ?? 0} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    {count} {count === 1 ? "review" : "reviews"}
                  </span>
                </div>

                {/* Breakdown — also the filter */}
                <div className="border-b border-cream px-8 py-8 lg:border-b-0 lg:border-r">
                  <ul className="space-y-2.5">
                    {distribution.map(({ stars, total }) => {
                      const pct = count ? Math.round((total / count) * 100) : 0;
                      const active = ratingFilter === stars;
                      return (
                        <li key={stars}>
                          <button
                            type="button"
                            disabled={total === 0}
                            onClick={() => selectRating(active ? null : stars)}
                            aria-pressed={active}
                            className="flex w-full items-center gap-3 rounded-lg py-0.5 text-left transition disabled:cursor-default disabled:opacity-45"
                          >
                            <span
                              className={`w-10 shrink-0 text-xs font-semibold tabular-nums ${
                                active ? "text-accent" : "text-charcoal"
                              }`}
                            >
                              {stars} ★
                            </span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                              <span
                                className={`block h-full rounded-full transition-all duration-500 ${
                                  active ? "bg-accent" : "bg-mango"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted">
                              {total}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Provenance */}
                <div className="flex flex-col justify-center gap-3 bg-cream/40 px-8 py-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-accent ring-1 ring-accent/20">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <p className="text-xs leading-relaxed text-muted">
                    Every review here was written by a signed-in customer and
                    published after a moderation check. We don&apos;t edit the
                    wording and we don&apos;t remove low ratings.
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="reveal mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectRating(null)}
                  className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                    ratingFilter === null
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-charcoal/15 text-charcoal hover:border-charcoal/40"
                  }`}
                >
                  All ratings
                </button>
                {ratingFilter !== null && (
                  <span className="text-xs text-muted">
                    Showing {shown.length}{" "}
                    {shown.length === 1 ? "review" : "reviews"} at{" "}
                    {ratingFilter} ★
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  Sort
                </span>
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSort(s.key)}
                    aria-pressed={sort === s.key}
                    className={`rounded-full border px-4 py-2 text-[11px] font-semibold transition ${
                      sort === s.key
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-charcoal/15 text-muted hover:border-charcoal/40 hover:text-charcoal"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.slice(0, visible).map((review, i) => {
                const long = review.text.length > 260;
                const open = expanded.has(review.id);
                return (
                  <article
                    key={review.id}
                    className="reveal flex flex-col rounded-[28px] border border-cream bg-ivory p-6 shadow-sm transition duration-300 hover:shadow-md md:p-7"
                    style={{ transitionDelay: `${Math.min(i, 5) * 50}ms` }}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mango/25 font-serif text-sm font-semibold text-accent">
                        {initials(review.user.name)}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-charcoal">
                          {review.user.name}
                        </span>
                        <span className="text-[11px] text-muted">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>

                    <Stars n={review.rating} className="mb-3" />
                    <span className="sr-only">{review.rating} out of 5</span>

                    <p
                      className={`text-sm leading-relaxed text-muted ${
                        long && !open ? "line-clamp-5" : ""
                      }`}
                    >
                      {review.text}
                    </p>

                    {long && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(review.id)}
                        className="mt-3 self-start text-[11px] font-bold uppercase tracking-[0.14em] text-accent hover:underline"
                      >
                        {open ? "Show less" : "Read more"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            {visible < shown.length && (
              <div className="reveal mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center justify-center rounded-full border border-charcoal/20 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal transition duration-300 hover:border-charcoal hover:bg-charcoal hover:text-ivory"
                >
                  Load {Math.min(PAGE_SIZE, shown.length - visible)} more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
