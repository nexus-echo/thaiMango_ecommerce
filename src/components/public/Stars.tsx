import { Star } from "lucide-react";

interface StarsProps {
  /** Rating out of 5; rounded to the nearest whole star. */
  n: number;
  className?: string;
}

/**
 * Five-star rating display, in the pack's gold rather than a generic amber.
 *
 * One component for every place a rating is shown — the buy box and the
 * reviews section previously each had their own copy, drawn in different
 * colours, which is exactly how two ratings on one page end up disagreeing
 * about what four stars looks like.
 *
 * Decorative: callers state the rating in text alongside it.
 */
export default function Stars({ n, className = "" }: StarsProps) {
  const filled = Math.round(n);
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= filled ? "fill-mango text-mango" : "fill-transparent text-cream"
          }`}
        />
      ))}
    </span>
  );
}
