import { Info } from "lucide-react";
import { MICRONUTRIENTS, NUTRITION, type KnowFact } from "@/lib/product-story";

interface KnowYourMangoProps {
  intro: string;
  facts: KnowFact[];
  /** The product's own `ingredients` line, shown as the label panel. */
  ingredients?: string | null;
}

const FALLBACK_INGREDIENTS = "Mangifera Indica (Mango).";

/* One strip outline, drawn once and re-used at three angles. Coordinates are
   centred on the origin so each instance only needs a translate/rotate. */
const STRIP_PATH =
  "M -128,2 C -124,-24 -78,-34 -18,-31 C 42,-28 102,-22 126,-9 C 134,-4 134,6 126,11 C 102,25 42,31 -18,34 C -78,37 -124,28 -128,2 Z";

/**
 * Line drawing of what a strip looks like when it is dried rather than
 * candied: uneven edges, visible grain, and a cut thick enough to stay chewy.
 *
 * Drawn rather than photographed on purpose — the point of this panel is the
 * 6–8 mm measurement, and no top-down photo can show a thickness.
 */
function MangoStripDiagram() {
  return (
    <svg
      viewBox="0 0 560 420"
      role="img"
      aria-label="Diagram of dried mango strips on a plate, with a side view showing a six to eight millimetre cut"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="kym-flesh" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#FFD873" />
          <stop offset="55%" stopColor="#ECA40C" />
          <stop offset="100%" stopColor="#C4840A" />
        </linearGradient>
        <linearGradient id="kym-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE490" />
          <stop offset="100%" stopColor="#ECA40C" />
        </linearGradient>
        <radialGradient id="kym-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFE490" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE490" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="560" height="420" fill="none" />
      <circle cx="280" cy="230" r="215" fill="url(#kym-glow)" />

      {/* Sun arc — the drying half of the process, kept to a whisper */}
      <g stroke="#B47404" strokeOpacity="0.28" strokeLinecap="round" fill="none">
        <path d="M 52 96 A 58 58 0 0 1 168 96" strokeWidth="2" />
        <path d="M 74 70 L 66 56" strokeWidth="2" />
        <path d="M 110 60 L 110 44" strokeWidth="2" />
        <path d="M 146 70 L 154 56" strokeWidth="2" />
      </g>

      {/* Plate */}
      <ellipse cx="280" cy="308" rx="205" ry="66" fill="#F4E4D4" />
      <ellipse
        cx="280"
        cy="303"
        rx="205"
        ry="66"
        fill="#FFF9E9"
        stroke="#E4D2BE"
        strokeWidth="2"
      />
      <ellipse
        cx="280"
        cy="303"
        rx="172"
        ry="50"
        fill="none"
        stroke="#E4D2BE"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* Three strips, back to front */}
      {[
        { t: "translate(258 252) rotate(-8) scale(0.92)", o: 0.85 },
        { t: "translate(306 288) rotate(5) scale(0.96)", o: 0.93 },
        { t: "translate(268 322) rotate(-2)", o: 1 },
      ].map((s, i) => (
        <g key={i} transform={s.t} opacity={s.o}>
          <path
            d={STRIP_PATH}
            fill="url(#kym-flesh)"
            stroke="#A96F06"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Grain — the ridges slow drying leaves behind */}
          <g
            stroke="#8A5A05"
            strokeOpacity="0.32"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M -96 -14 C -50 -22 30 -18 100 -4" />
            <path d="M -104 4 C -54 -4 26 0 104 8" />
            <path d="M -92 20 C -46 14 26 16 96 20" />
          </g>
          {/* Natural sugar bloom */}
          <ellipse
            cx="-52"
            cy="-10"
            rx="26"
            ry="9"
            fill="#FFF3CE"
            opacity="0.5"
          />
        </g>
      ))}

      {/* Side view + thickness bracket */}
      <g transform="translate(348 92)">
        <rect
          x="-6"
          y="-24"
          width="196"
          height="82"
          rx="18"
          fill="#FFF9E9"
          stroke="#E4D2BE"
          strokeWidth="1.5"
        />
        <rect
          x="16"
          y="4"
          width="128"
          height="20"
          rx="10"
          fill="url(#kym-edge)"
          stroke="#A96F06"
          strokeWidth="1.8"
        />
        {/* Bracket */}
        <g stroke="#502500" strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M 156 4 L 168 4" />
          <path d="M 156 24 L 168 24" />
          <path d="M 162 4 L 162 24" />
        </g>
        <text
          x="70"
          y="48"
          textAnchor="middle"
          fill="#502500"
          fontSize="17"
          fontWeight="700"
          letterSpacing="0.5"
        >
          6–8 mm cut
        </text>
        <text
          x="70"
          y="-6"
          textAnchor="middle"
          fill="#7A6242"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1.6"
        >
          SIDE VIEW
        </text>
      </g>
    </svg>
  );
}

/**
 * "Know Your Mango" — the provenance panel.
 *
 * Two halves that answer different questions: where the fruit came from and
 * how it was cut (left/top), and what the pouch declares (right/bottom). The
 * ingredient line is the product's own, so this never contradicts the label.
 */
export default function KnowYourMango({
  intro,
  facts,
  ingredients,
}: KnowYourMangoProps) {
  return (
    <section className="bg-ivory py-16 md:py-24 border-t border-cream">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <div className="reveal mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-accent/50" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
              Know Your Mango
            </span>
            <span className="h-px w-10 bg-accent/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium leading-[1.1] tracking-[-0.02em] text-charcoal">
            One fruit, one country, one cut
          </h2>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-muted">
            {intro}
          </p>
        </div>

        {/* Diagram + provenance facts */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div className="reveal rounded-[32px] border border-cream bg-cream/30 p-6 md:p-10">
            <MangoStripDiagram />
            <p className="mt-4 text-center text-xs leading-relaxed text-muted">
              Uneven edges and visible grain are what slow drying looks like. A
              uniform, glassy slice has usually been soaked in syrup first.
            </p>
          </div>

          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className="reveal border-t border-cream pt-5"
                style={{ transitionDelay: `${Math.min(i, 5) * 60}ms` }}
              >
                <dt className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                  {fact.label}
                </dt>
                <dd>
                  <span className="block font-serif text-xl leading-snug text-charcoal md:text-2xl">
                    {fact.value}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                    {fact.note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Nutrition + label */}
        <div className="reveal mt-14 grid overflow-hidden rounded-[32px] border border-cream bg-white shadow-sm md:mt-20 md:grid-cols-2">
          {/* Typical values */}
          <div className="border-b border-cream p-8 md:border-b-0 md:border-r md:p-10">
            <h3 className="mb-1 font-serif text-2xl text-charcoal">
              Nutrition
            </h3>
            <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Per 70 g pouch · one serving
            </p>

            <ul className="space-y-4">
              {NUTRITION.map((row) => (
                <li key={row.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-4">
                    <span
                      className={`text-sm ${
                        row.nested ? "pl-4 text-muted" : "font-semibold text-charcoal"
                      }`}
                    >
                      {row.label}
                    </span>
                    <span className="flex items-baseline gap-3">
                      <span className="font-serif text-base text-charcoal tabular-nums">
                        {row.value}
                      </span>
                      {row.share !== null && (
                        <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-muted">
                          {row.share}%
                        </span>
                      )}
                    </span>
                  </div>
                  {/* Only rows the label gives a percentage for get a bar —
                      inventing one for the rest would be us, not the pack. */}
                  {row.share !== null && (
                    <span
                      aria-hidden
                      className="block h-1 w-full overflow-hidden rounded-full bg-cream"
                    >
                      <span
                        className="block h-full rounded-full bg-mango"
                        style={{ width: `${Math.min(row.share, 100)}%` }}
                      />
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Vitamins and minerals, as the same panel declares them */}
            <ul className="mt-7 flex flex-wrap gap-2 border-t border-cream pt-6">
              {MICRONUTRIENTS.map((m) => (
                <li
                  key={m.label}
                  className="rounded-full border border-cream bg-cream/40 px-3.5 py-1.5 text-[11px] font-semibold text-charcoal"
                >
                  {m.label}{" "}
                  <span className="tabular-nums text-muted">{m.percent}%</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 flex gap-2 text-[11px] leading-relaxed text-muted">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>
                Transcribed from the pouch. Percentages are % Thai RDI on a
                2,000 kcal diet, as printed. Figures vary by flavor — the pack
                in your hand is the one that counts.
              </span>
            </p>
          </div>

          {/* What the label says */}
          <div className="bg-cream/30 p-8 md:p-10">
            <h3 className="mb-1 font-serif text-2xl text-charcoal">
              On the label
            </h3>
            <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Everything in the pouch, in order
            </p>

            <p className="text-sm leading-relaxed text-charcoal">
              {ingredients?.trim() || FALLBACK_INGREDIENTS}
            </p>

            <div className="mt-8 space-y-3 border-t border-cream pt-7">
              {[
                ["Never added", "Preservatives, artificial colour or flavour"],
                ["Suitable for", "Vegetarian and vegan diets"],
                ["Allergen advice", "Packed where tree nuts and sulfites are handled"],
                ["Storage", "Cool and dry, out of direct sunlight"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="w-36 shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                    {label}
                  </span>
                  <span className="text-sm leading-relaxed text-charcoal">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
