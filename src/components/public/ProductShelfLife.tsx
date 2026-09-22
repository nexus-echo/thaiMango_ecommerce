import { RefreshCw, Snowflake, Sun } from "lucide-react";
import { SHELF_LIFE } from "@/lib/product-story";

interface ProductShelfLifeProps {
  /** The product's own `storage_info`; the band falls back to a generic line. */
  storageInfo?: string | null;
}

const FALLBACK_STORAGE =
  "Keep in a cool, dry place away from direct sunlight. The resealable pouch locks in freshness after opening.";

const RULES = [
  {
    icon: RefreshCw,
    label: "After opening",
    value: SHELF_LIFE.openedLabel,
    note: "Press the zip closed. The strips stay chewy; left open they go firm.",
  },
  {
    icon: Sun,
    label: "Store at",
    value: SHELF_LIFE.storeAt,
    note: "Out of direct sunlight — heat darkens the fruit long before it spoils.",
  },
  {
    icon: Snowflake,
    label: "Refrigeration",
    value: "Not needed",
    note: "Cold air is damp air. The cupboard beats the fridge for dried fruit.",
  },
];

/**
 * "Shelf Life" — the one number people scan for, plus the three rules that
 * actually decide whether a pouch is still good.
 *
 * The prose underneath is the product's own `storage_info`, so an admin edit
 * to a SKU shows here without touching this file; only the headline numerals
 * are site copy (lib/product-story).
 */
export default function ProductShelfLife({
  storageInfo,
}: ProductShelfLifeProps) {
  return (
    <section className="bg-ivory py-16 md:py-20 border-t border-cream">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="reveal mb-10 text-center">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-accent/50" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
              Shelf Life
            </span>
            <span className="h-px w-10 bg-accent/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-medium leading-[1.1] tracking-[-0.02em] text-charcoal">
            Good for a year. Best in the first six months.
          </h2>
        </div>

        <div className="reveal mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-cream bg-white shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            {/* The headline number */}
            <div className="flex flex-col justify-center gap-4 border-b border-cream bg-cream/40 px-8 py-10 text-center lg:border-b-0 lg:border-r lg:text-left">
              <div>
                <span className="font-serif text-[4.5rem] leading-none tracking-[-0.03em] text-accent md:text-[5.5rem]">
                  {SHELF_LIFE.unopenedMonths}
                </span>
                <span className="ml-2 font-serif text-2xl text-charcoal">
                  months
                </span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                Unopened, from the pack date
              </p>

              {/* Freshness run — full flavour, then a long safe tail */}
              <div className="mt-2">
                <span
                  aria-hidden
                  className="block h-1.5 w-full overflow-hidden rounded-full bg-cream"
                >
                  <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-mango to-accent" />
                </span>
                <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  <span>Packed</span>
                  <span>Peak · 6 mo</span>
                  <span>12 mo</span>
                </div>
              </div>
            </div>

            {/* The three rules */}
            <ul className="divide-y divide-cream sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {RULES.map((rule) => (
                <li key={rule.label} className="px-6 py-7 md:px-7">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/60 text-accent">
                    <rule.icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    {rule.label}
                  </span>
                  <span className="mb-2 block font-serif text-xl text-charcoal">
                    {rule.value}
                  </span>
                  <p className="text-xs leading-relaxed text-muted">
                    {rule.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="reveal mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted md:text-sm">
          {storageInfo?.trim() || FALLBACK_STORAGE}
        </p>
      </div>
    </section>
  );
}
