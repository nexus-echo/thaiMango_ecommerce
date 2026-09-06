import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerProps {
  /* Every page passes its own copy so the closing CTA speaks to that page's
     context rather than repeating one generic line site-wide. */
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/* Closing call-to-action band. Sits just above the site footer on every public
   page except the home page. Editorial split layout — oversized headline on the
   left, supporting copy and actions on the right — framed with the brand's
   corner-accent motif. */
export default function CtaBanner({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaBannerProps) {
  return (
    <section className="relative isolate w-full overflow-hidden border-t border-ivory/10 bg-charcoal text-ivory">
      {/* Ambient depth: warm gold glow top-right, deep beetroot fade bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 88% -10%, rgba(229,184,105,0.15), transparent 55%), radial-gradient(90% 100% at -10% 110%, rgba(100,12,38,0.45), transparent 60%)",
        }}
      />
      {/* Corner frame accents — echoes the hero and heritage sections */}
      <div aria-hidden className="pointer-events-none absolute inset-5 md:inset-8">
        <span className="absolute left-0 top-0 h-12 w-12 border-l border-t border-gold/25" />
        <span className="absolute bottom-0 right-0 h-12 w-12 border-b border-r border-gold/25" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-6 py-24 md:px-12 md:py-32 lg:py-36">
        <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-[1.35fr_1fr]">
          {/* Headline */}
          <div>
            <div className="mb-7 flex items-center gap-4">
              <span className="h-px w-10 bg-gold/50" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
                {eyebrow}
              </span>
            </div>
            <h2 className="max-w-2xl font-serif text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] md:text-5xl lg:text-[3.4rem]">
              {title}
            </h2>
          </div>

          {/* Supporting copy + actions */}
          <div className="lg:pb-2">
            <p className="mb-9 max-w-md text-sm leading-relaxed text-ivory/60 md:text-base">
              {description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal transition duration-300 hover:bg-ivory"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              {secondaryLabel && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center justify-center rounded-full border border-ivory/25 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ivory transition duration-300 hover:border-ivory hover:bg-ivory hover:text-charcoal"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
