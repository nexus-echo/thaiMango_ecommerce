import Image from "next/image";
import type { StoryPoint } from "@/lib/product-story";

interface ProductUsesProps {
  uses: StoryPoint[];
  image: string;
  imageAlt: string;
  /** Product name, so the intro line names what is being eaten. */
  productName: string;
}

/**
 * "Uses" — the ways a pouch actually gets eaten.
 *
 * Deliberately not a card grid: six equal cards make six equal suggestions,
 * and the first two (eat it, pack it) are the ones almost everyone acts on.
 * A numbered list reads top-down, so the ordering carries that weight, and the
 * photo anchors the column beside it rather than repeating six times.
 */
export default function ProductUses({
  uses,
  image,
  imageAlt,
  productName,
}: ProductUsesProps) {
  return (
    <section className="bg-ivory py-16 md:py-24 border-t border-cream">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-20">
          {/* Image column — sticks while the longer list scrolls past it */}
          <div className="reveal lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[28px] border border-cream bg-cream/40 aspect-4/5 sm:aspect-16/11 lg:aspect-4/5 shadow-sm">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={70}
                className="object-cover"
              />
              {/* Corner frame accents — the motif used on the CTA band and hero */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-4 h-10 w-10 border-l border-t border-ivory/70"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b border-r border-ivory/70"
              />
            </div>
            <span className="mt-5 -rotate-2 inline-block bg-mango px-3 py-1 font-serif text-base font-semibold uppercase tracking-wide text-charcoal shadow-sm">
              Three or four strips is a serving
            </span>
          </div>

          {/* List column */}
          <div>
            <div className="reveal mb-10 md:mb-12">
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-10 bg-accent/50" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                  Uses
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium leading-[1.1] tracking-[-0.02em] text-charcoal">
                Ways people actually eat it
              </h2>
              <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed text-muted">
                {productName} needs no preparation at all — but it does a lot
                more than sit in a bowl. Six of the uses our customers report
                most often.
              </p>
            </div>

            <ol className="divide-y divide-cream border-t border-cream">
              {uses.map((use, i) => (
                <li
                  key={use.title}
                  className="reveal group flex gap-5 py-6 md:gap-7 md:py-7"
                  style={{ transitionDelay: `${Math.min(i, 5) * 60}ms` }}
                >
                  <span
                    aria-hidden
                    className="font-serif text-2xl md:text-[1.75rem] leading-none text-accent/35 tabular-nums transition-colors duration-300 group-hover:text-accent"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="mb-1.5 text-base md:text-lg font-semibold text-charcoal">
                      {use.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {use.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
