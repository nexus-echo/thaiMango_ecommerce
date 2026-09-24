"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Check, Info, ShoppingBag, Star } from "lucide-react";
import Stars from "@/components/public/Stars";
import ReviewDialog, {
  REVIEW_RATING_PARAM,
  REVIEW_RESUME_PARAM,
  type MyReviewState,
} from "@/components/public/ReviewDialog";
import { useStore } from "@/components/public/store";
import { unwrap } from "@/lib/http";
import type { DetailProduct, DetailReview } from "@/lib/productDetail";

interface ProductReviewsProps {
  slug: string;
  reviews: DetailReview[];
  average: number | null;
  count: number;
  productName: string;
  productImage: string;
}

type SortKey = "helpful" | "recent" | "highest" | "lowest";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "helpful", label: "Most helpful" },
  { key: "recent", label: "Newest" },
  { key: "highest", label: "Highest rated" },
  { key: "lowest", label: "Lowest rated" },
];

const PAGE_SIZE = 4;

/* Pack-palette avatar tints, picked by name so a reviewer keeps theirs. */
const AVATAR_TINTS = [
  "bg-mango/25 text-burgundy",
  "bg-cream text-beetroot",
  "bg-gold/60 text-burgundy",
  "bg-beetroot/15 text-beetroot",
];

/* Deterministic between server and client — Intl's default locale is not. */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function Avatar({ name, size = "h-9 w-9 text-xs" }: { name: string; size?: string }) {
  const tint = AVATAR_TINTS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${tint}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/**
 * Ratings & reviews, laid out the way the Google Play Store does it:
 *
 *  1. "Rate this product" — five empty stars (tap one to start a review with
 *     that rating) and a Write a review button. Once the customer has
 *     reviewed, this becomes "Your review" with its moderation status.
 *  2. "Ratings and reviews" — sort chips, the big average, and 5→1 bars (the
 *     bars double as a rating filter).
 *  3. The reviews themselves, each with "N people found this helpful" and a
 *     Yes / No vote.
 *
 * Only PUBLISHED reviews reach the list (see /api/products/[slug]); new and
 * edited reviews go through Admin → Reviews first.
 */
export default function ProductReviews({
  slug,
  reviews,
  average,
  count,
  productName,
  productImage,
}: ProductReviewsProps) {
  const { user, showToast } = useStore();
  const queryClient = useQueryClient();
  const signedIn = Boolean(user?.isLoggedIn);

  const [sort, setSort] = useState<SortKey>("helpful");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [hoverStar, setHoverStar] = useState(0);
  const [dialog, setDialog] = useState<{ open: boolean; rating: number }>({
    open: false,
    rating: 0,
  });

  /* The customer's own review (whatever its status) and whether they've
     bought this product — only buyers may review. */
  const myReviewQuery = useQuery({
    queryKey: ["my-review", slug],
    queryFn: () => unwrap<MyReviewState>(axios.get(`/api/products/${slug}/reviews`)),
    enabled: signedIn,
  });
  const myReview = signedIn ? (myReviewQuery.data?.review ?? null) : null;
  const purchased = signedIn && Boolean(myReviewQuery.data?.purchased);
  /* Signed in, answer known, and not a buyer → show the buyers-only note
     instead of stars. Guests still see the stars (they may be buyers who
     just aren't signed in); the dialog asks them to sign in. */
  const notABuyer = signedIn && myReviewQuery.isFetched && !purchased;
  const reviewStateLoading = signedIn && !myReviewQuery.isFetched;

  /* A guest who hit "Sign in" in the review form comes back here as
     ?review=write(&rating=N). Once they're signed in and we know whether
     they already have a review (so an edit opens pre-filled), scroll to the
     section, reopen the form, and drop the marker so a refresh doesn't
     reopen it again. */
  const resumeReady = signedIn && myReviewQuery.isFetched;
  useEffect(() => {
    if (!resumeReady) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(REVIEW_RESUME_PARAM) !== "write") return;
    const rating = Number(params.get(REVIEW_RATING_PARAM));

    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    /* Open once the scroll has mostly landed. The URL is cleaned up here too
       (not before the timer) so a cancelled run still leaves the marker. */
    const timer = window.setTimeout(() => {
      params.delete(REVIEW_RESUME_PARAM);
      params.delete(REVIEW_RATING_PARAM);
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}#reviews`
      );
      setDialog({ open: true, rating: rating >= 1 && rating <= 5 ? rating : 0 });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [resumeReady]);

  const voteMutation = useMutation({
    mutationFn: ({ id, helpful }: { id: number; helpful: boolean | null }) =>
      unwrap<{ helpful_count: number; my_vote: boolean | null }>(
        axios.post(`/api/reviews/${id}/vote`, { helpful })
      ),
    onSuccess: (result, { id }) => {
      queryClient.setQueryData<DetailProduct>(["product", slug], (product) =>
        product
          ? {
              ...product,
              reviews: product.reviews.map((r) =>
                r.id === id
                  ? { ...r, helpful_count: result.helpful_count, my_vote: result.my_vote }
                  : r
              ),
            }
          : product
      );
    },
    onError: (error: Error) => showToast(error.message),
  });

  const vote = (review: DetailReview, helpful: boolean) => {
    if (!signedIn) {
      showToast("Sign in to rate reviews");
      return;
    }
    /* Tapping your current answer again takes the vote back. */
    voteMutation.mutate({
      id: review.id,
      helpful: review.my_vote === helpful ? null : helpful,
    });
  };

  const distribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        total: reviews.filter((r) => Math.round(r.rating) === stars).length,
      })),
    [reviews]
  );

  const shown = useMemo(() => {
    const filtered =
      ratingFilter === null
        ? reviews
        : reviews.filter((r) => Math.round(r.rating) === ratingFilter);
    const newest = (a: DetailReview, b: DetailReview) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return [...filtered].sort((a, b) => {
      if (sort === "helpful") return b.helpful_count - a.helpful_count || newest(a, b);
      if (sort === "highest") return b.rating - a.rating || newest(a, b);
      if (sort === "lowest") return a.rating - b.rating || newest(a, b);
      return newest(a, b);
    });
  }, [reviews, ratingFilter, sort]);

  const openDialog = (rating = 0) => setDialog({ open: true, rating });
  const closeDialog = useCallback(() => setDialog({ open: false, rating: 0 }), []);

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
    <section id="reviews" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        {/* 1 — Rate this product / Your review */}
        {myReview ? (
          <div className="mb-16">
            <h2 className="text-2xl font-medium text-charcoal">Your review</h2>
            <div className="mt-5 rounded-2xl border border-cream p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={user?.name ?? "You"} />
                <span className="text-sm text-charcoal">{user?.name}</span>
                <span
                  className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    myReview.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {myReview.status === "PUBLISHED" ? "Published" : "Awaiting approval"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Stars n={myReview.rating} />
                <span className="text-xs text-muted">{formatDate(myReview.created_at)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{myReview.text}</p>
              {purchased && (
                <button
                  type="button"
                  onClick={() => openDialog(myReview.rating)}
                  className="mt-4 text-sm font-semibold text-beetroot hover:underline"
                >
                  Edit your review
                </button>
              )}
            </div>
          </div>
        ) : notABuyer ? (
          <div className="mb-16">
            <h2 className="text-2xl font-medium text-charcoal">Rate this product</h2>
            <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-cream bg-ivory/60 p-5 sm:flex-row sm:items-center md:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mango/20 text-beetroot">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal">
                  Reviews are from verified buyers
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Once you&apos;ve ordered {productName}, you&apos;ll be able to rate and
                  review it here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="shrink-0 rounded-lg bg-beetroot px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-burgundy"
              >
                Order now
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-16">
            <h2 className="text-2xl font-medium text-charcoal">Rate this product</h2>
            <p className="mt-1 text-sm text-muted">Tell others what you think.</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-2 sm:gap-4" onMouseLeave={() => setHoverStar(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openDialog(i)}
                    onMouseEnter={() => setHoverStar(i)}
                    onFocus={() => setHoverStar(i)}
                    onBlur={() => setHoverStar(0)}
                    disabled={reviewStateLoading}
                    aria-label={`Rate ${i} star${i === 1 ? "" : "s"}`}
                    className="rounded-full p-0.5 transition-transform duration-150 hover:scale-110 disabled:pointer-events-none"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors duration-150 md:h-11 md:w-11 ${
                        i <= hoverStar ? "fill-mango text-mango" : "fill-cream text-cream"
                      }`}
                      strokeWidth={1}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openDialog()}
                disabled={reviewStateLoading}
                className="rounded-lg bg-beetroot px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-burgundy disabled:opacity-60"
              >
                Write a review
              </button>
            </div>
          </div>
        )}

        {/* 2 — Ratings and reviews */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-medium text-charcoal">Ratings and reviews</h2>
          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-charcoal"
              aria-describedby="reviews-verified-note"
            >
              Ratings and reviews are verified
              <Info className="h-4 w-4" />
            </button>
            <p
              id="reviews-verified-note"
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-72 rounded-xl bg-charcoal px-4 py-3 text-xs leading-relaxed text-ivory opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              Only customers who bought this product can review it, and every
              review is checked before it&apos;s published. We don&apos;t edit the wording
              and we don&apos;t remove low ratings.
            </p>
          </div>
        </div>

        {count === 0 ? (
          <p className="mt-6 text-sm text-muted">
            No reviews yet. Customers who&apos;ve bought {productName} can be the first
            to rate it.
          </p>
        ) : (
          <>
            {/* Sort chips */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {SORTS.map((s) => {
                const active = sort === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSort(s.key)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition ${
                      active
                        ? "border-mango/50 bg-mango/15 font-medium text-burgundy"
                        : "border-charcoal/15 text-charcoal/75 hover:bg-cream/40"
                    }`}
                  >
                    {active && <Check className="h-4 w-4" />}
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Score + distribution */}
            <div className="mt-10 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-8 gap-y-2 sm:gap-x-12">
              <div className="flex flex-col">
                <span className="text-6xl font-normal leading-none tracking-tight text-charcoal md:text-7xl">
                  {(average ?? 0).toFixed(1)}
                </span>
                <Stars n={average ?? 0} className="mt-3" />
                <span className="mt-2 text-xs text-muted">
                  {count.toLocaleString("en-US")} {count === 1 ? "review" : "reviews"}
                </span>
              </div>

              <ul className="space-y-1.5">
                {distribution.map(({ stars, total }) => {
                  const pct = count ? (total / count) * 100 : 0;
                  const active = ratingFilter === stars;
                  return (
                    <li key={stars}>
                      <button
                        type="button"
                        disabled={total === 0}
                        onClick={() => selectRating(active ? null : stars)}
                        aria-pressed={active}
                        aria-label={`${stars} star: ${total} review${total === 1 ? "" : "s"}${
                          active ? " (filtering)" : ""
                        }`}
                        className="group flex w-full items-center gap-3 disabled:cursor-default"
                      >
                        <span
                          className={`w-3 text-xs tabular-nums ${
                            active ? "font-bold text-beetroot" : "text-muted"
                          }`}
                        >
                          {stars}
                        </span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream/70">
                          <span
                            className={`block h-full rounded-full transition-all duration-500 ${
                              active ? "bg-beetroot" : "bg-mango group-hover:bg-beetroot/70"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {ratingFilter !== null && (
              <p className="mt-6 text-sm text-muted">
                Showing {shown.length} {ratingFilter}-star{" "}
                {shown.length === 1 ? "review" : "reviews"} ·{" "}
                <button
                  type="button"
                  onClick={() => selectRating(null)}
                  className="font-semibold text-beetroot hover:underline"
                >
                  Show all
                </button>
              </p>
            )}

            {/* 3 — Reviews */}
            <div className="mt-12 space-y-10">
              {shown.slice(0, visible).map((review) => {
                const long = review.text.length > 280;
                const open = expanded.has(review.id);
                return (
                  <article key={review.id}>
                    <div className="flex items-center gap-4">
                      <Avatar name={review.user.name} />
                      <span className="text-sm text-charcoal">{review.user.name}</span>
                      {review.is_mine && (
                        <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-beetroot">
                          You
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Stars n={review.rating} />
                      <span className="sr-only">{review.rating} out of 5 stars.</span>
                      <span className="text-xs text-muted">{formatDate(review.created_at)}</span>
                    </div>

                    <p
                      className={`mt-2 text-sm leading-relaxed text-charcoal/70 ${
                        long && !open ? "line-clamp-4" : ""
                      }`}
                    >
                      {review.text}
                    </p>
                    {long && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(review.id)}
                        className="mt-1 text-sm font-semibold text-beetroot hover:underline"
                      >
                        {open ? "Show less" : "Read more"}
                      </button>
                    )}

                    {review.helpful_count > 0 && (
                      <p className="mt-3 text-xs text-muted">
                        {review.helpful_count}{" "}
                        {review.helpful_count === 1 ? "person" : "people"} found this review
                        helpful
                      </p>
                    )}

                    {!review.is_mine && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-muted">Did you find this helpful?</span>
                        {([true, false] as const).map((helpful) => {
                          const selected = review.my_vote === helpful;
                          return (
                            <button
                              key={String(helpful)}
                              type="button"
                              onClick={() => vote(review, helpful)}
                              disabled={voteMutation.isPending}
                              aria-pressed={selected}
                              className={`rounded-full border px-4 py-1 text-sm transition disabled:opacity-60 ${
                                selected
                                  ? "border-beetroot bg-beetroot/10 font-medium text-beetroot"
                                  : "border-charcoal/20 text-charcoal/80 hover:bg-cream/40"
                              }`}
                            >
                              {helpful ? "Yes" : "No"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {visible < shown.length && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="mt-10 text-sm font-semibold text-beetroot hover:underline"
              >
                See more reviews ({shown.length - visible})
              </button>
            )}
          </>
        )}
      </div>

      <ReviewDialog
        open={dialog.open}
        onClose={closeDialog}
        slug={slug}
        productName={productName}
        productImage={productImage}
        initialRating={dialog.rating}
        existing={myReview}
        purchased={purchased}
      />
    </section>
  );
}
