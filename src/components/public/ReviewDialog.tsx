"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ShoppingBag, Star, X } from "lucide-react";
import { useStore } from "@/components/public/store";
import { apiMessage } from "@/lib/http";
import { withReturnTo } from "@/lib/returnTo";
import { REVIEW_MAX_LENGTH, reviewSubmitSchema } from "@/schemas/review.schema";

export interface MyReview {
  id: number;
  rating: number;
  text: string;
  status: "PENDING" | "PUBLISHED";
  created_at: string;
}

/** GET /api/products/[slug]/reviews — cached under ["my-review", slug]. */
export interface MyReviewState {
  review: MyReview | null;
  /** Has a non-cancelled order for this product, so may review it. */
  purchased: boolean;
}

/* Query params that reopen the dialog after a guest signs in. */
export const REVIEW_RESUME_PARAM = "review";
export const REVIEW_RATING_PARAM = "rating";

const RATING_LABELS =["", "Hated it", "Disliked it", "It's OK", "Liked it", "Loved it"];

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  productName: string;
  productImage: string;
  /** Star the customer tapped to open the dialog (0 = none yet). */
  initialRating: number;
  /** Their existing review, when editing. */
  existing: MyReview | null;
  /** Signed-in viewer has bought this product (only buyers may review). */
  purchased: boolean;
}

/**
 * Play-Store-style "write a review" sheet: product header, a big star picker
 * with a word for each rating, and a text box. Bottom sheet on phones, centred
 * dialog from `sm` up. Guests get a sign-in prompt, and signed-in customers
 * who haven't bought the product are told only buyers can review it.
 */
export default function ReviewDialog(props: ReviewDialogProps) {
  /* Remount per opening so the form always starts from the latest values. */
  if (!props.open) return null;
  return <ReviewDialogBody {...props} />;
}

function ReviewDialogBody({
  onClose,
  slug,
  productName,
  productImage,
  initialRating,
  existing,
  purchased,
}: ReviewDialogProps) {
  const { user, showToast } = useStore();
  const queryClient = useQueryClient();
  const signedIn = Boolean(user?.isLoggedIn);

  /* Where sign-in / sign-up should send a guest back to: this product, with
     the form reopening (and the star they tapped) — see ProductReviews. */
  const resumeHref = `/product-detail/${slug}?${REVIEW_RESUME_PARAM}=write${
    initialRating ? `&${REVIEW_RATING_PARAM}=${initialRating}` : ""
  }`;

  const [rating, setRating] = useState(initialRating || existing?.rating || 0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(existing?.text ?? "");
  const [error, setError] = useState("");

  /* Esc closes; the page behind doesn't scroll while the sheet is up. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const submit = useMutation({
    mutationFn: async (values: { rating: number; text: string }) => {
      const res = await axios.post<{ data: MyReview; message: string }>(
        `/api/products/${slug}/reviews`,
        values
      );
      return res.data;
    },
    onSuccess: ({ data, message }) => {
      queryClient.setQueryData<MyReviewState>(["my-review", slug], {
        review: data,
        purchased: true,
      });
      /* An edit pulls a published review back into moderation. */
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
      showToast(message);
      onClose();
    },
    onError: (err) => setError(apiMessage(err)),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewSubmitSchema.safeParse({ rating, text });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your review");
      return;
    }
    setError("");
    submit.mutate(parsed.data);
  };

  const shown = hover || rating;
  const trimmedLength = text.trim().length;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl md:p-7"
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream">
            <Image src={productImage} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="review-dialog-title" className="truncate text-base font-semibold text-charcoal">
              {productName}
            </h2>
            <p className="text-xs text-muted">
              Reviews are public and checked before they appear.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-cream/60 hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!signedIn ? (
          <div className="py-4 text-center">
            <p className="mb-1 text-base font-medium text-charcoal">Sign in to write a review</p>
            <p className="mb-6 text-sm text-muted">
              Only customers who&apos;ve bought {productName} can review it. Sign
              in with the account you ordered with.
            </p>
            {/* No "Create account" here — a brand-new account has no orders,
                so it could never review. */}
            <Link
              href={withReturnTo("/login", resumeHref)}
              className="inline-block rounded-lg bg-beetroot px-8 py-3 text-sm font-semibold text-white transition hover:bg-burgundy"
            >
              Sign in
            </Link>
          </div>
        ) : !purchased ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mango/20 text-beetroot">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <p className="mb-1 text-base font-medium text-charcoal">
              Reviews are from verified buyers
            </p>
            <p className="mb-6 text-sm text-muted">
              Once you&apos;ve ordered {productName}, you&apos;ll be able to rate
              and review it here.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-lg bg-beetroot px-6 py-3 text-sm font-semibold text-white transition hover:bg-burgundy"
              >
                Order now
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-cream/50"
              >
                Got it
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {/* Star picker */}
            <div className="mb-6 flex flex-col items-center">
              <div className="flex gap-2" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHover(i)}
                    aria-label={`${i} star${i === 1 ? "" : "s"} — ${RATING_LABELS[i]}`}
                    aria-pressed={rating === i}
                    className="rounded-full p-1 transition-transform duration-150 hover:scale-110"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors duration-150 ${
                        i <= shown ? "fill-mango text-mango" : "fill-cream text-cream"
                      }`}
                      strokeWidth={1.25}
                    />
                  </button>
                ))}
              </div>
              <span className="mt-2 h-5 text-sm font-medium text-beetroot">
                {RATING_LABELS[shown]}
              </span>
            </div>

            <label htmlFor="review-text" className="sr-only">
              Your review
            </label>
            <textarea
              id="review-text"
              rows={5}
              maxLength={REVIEW_MAX_LENGTH}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your experience — taste, texture, would you buy it again?"
              className="w-full resize-none rounded-xl border border-charcoal/15 px-4 py-3 text-sm leading-relaxed text-charcoal transition placeholder:text-muted/70 focus:border-beetroot focus:outline-none focus:ring-2 focus:ring-beetroot/15"
            />
            <div className="mt-1.5 flex items-start justify-between gap-4">
              <p className="text-xs text-rose-600" role="alert">
                {error}
              </p>
              <span className="shrink-0 text-xs tabular-nums text-muted">
                {text.length}/{REVIEW_MAX_LENGTH}
              </span>
            </div>

            {existing && (
              <p className="mt-3 text-xs text-muted">
                Editing replaces your current review, and it will be checked again
                before it reappears.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-beetroot transition hover:bg-cream/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submit.isPending || rating === 0 || trimmedLength < 10}
                className="rounded-lg bg-beetroot px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submit.isPending ? "Posting…" : existing ? "Update" : "Post"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
