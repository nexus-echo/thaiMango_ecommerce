import { Zap } from "lucide-react";

/**
 * Urgency pill for products the API has flagged as moving quickly. The demand
 * rule lives server-side in lib/sellingFast — this only renders the verdict,
 * so the badge can never appear on a product the API did not qualify.
 *
 * The halo and bolt animations are defined in globals.css and both stop under
 * `prefers-reduced-motion`.
 */
export default function SellingFastBadge({
    className = "",
}: {
    className?: string;
}) {
    return (
        <span
            className={`selling-fast pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent ring-1 ring-accent/25 shadow-sm backdrop-blur-sm ${className}`}
        >
            <Zap className="selling-fast-bolt h-3.5 w-3.5 fill-current" aria-hidden />
            Selling Fast
        </span>
    );
}
