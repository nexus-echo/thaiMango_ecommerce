import {
  Leaf,
  Package,
  ShieldCheck,
  Sparkles,
  Sun,
  Wheat,
} from "lucide-react";
import type { StoryPoint } from "@/lib/product-story";

/* Cycled across the grid in order, the way the showcase cycles its highlight
   icons. Six icons for six benefits — a shorter list simply uses the first n. */
const BENEFIT_ICONS = [Leaf, Sparkles, Wheat, Sun, ShieldCheck, Package];

interface ProductBenefitsProps {
  benefits: StoryPoint[];
  /** Badges from the product row — shown as the band's closing claim strip. */
  highlights: string[];
}

/**
 * "Benefits" — what the fruit and the drying method give you.
 *
 * Runs on the cream panel so the page breathes between two ivory sections, and
 * the claims stay descriptive ("keeps the fruit's fibre") rather than medical.
 * Copy lives in lib/product-story keyed by category.
 */
export default function ProductBenefits({
  benefits,
  highlights,
}: ProductBenefitsProps) {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <div className="reveal mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-accent/50" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
              Benefits
            </span>
            <span className="h-px w-10 bg-accent/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium leading-[1.1] tracking-[-0.02em] text-charcoal">
            What you get when only the water leaves
          </h2>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-muted">
            Drying concentrates a mango; it doesn&apos;t rebuild one. That single
            decision is behind every line below.
          </p>
        </div>

        {/* Benefit grid */}
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-14">
          {benefits.map((benefit, i) => {
            const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <div
                key={benefit.title}
                className="reveal border-t border-charcoal/10 pt-6"
                style={{ transitionDelay: `${Math.min(i, 5) * 70}ms` }}
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-accent ring-1 ring-accent/20">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="mb-2 text-base md:text-lg font-semibold leading-snug text-charcoal">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {benefit.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Closing claim strip — the product's own badges, restated as a rule */}
        {highlights.length > 0 && (
          <ul className="reveal mt-14 flex flex-wrap items-center justify-center gap-2.5 md:mt-16">
            {highlights.map((h) => (
              <li
                key={h}
                className="rounded-full border border-accent/25 bg-ivory px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal"
              >
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
