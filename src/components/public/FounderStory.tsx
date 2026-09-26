import { ArrowDown, ArrowRight, Dna, Leaf, Microscope, Zap } from "lucide-react";
import TwoToneTitle from "./TwoToneTitle";

/* The founder's story on /about-us, section by section as written in the
   brand document (Mangobangkok.docx, "OUR FOUNDER"). Wording is the
   document's own, trimmed for length only — it is deliberately careful about
   health claims ("does not mean that ordinary food should be presented as a
   pharmaceutical treatment"), so keep new copy within that line. */

const eyebrow = "mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-accent";
const body = "text-sm leading-7 text-muted md:text-base md:leading-8";

const systems = [
  "Metabolism",
  "Inflammation",
  "Immune regulation",
  "Oxidative balance",
  "Mitochondrial function",
  "Cellular repair",
  "Gene regulation",
  "The microbiome",
];

const foodRoles = [
  "Some become nutrients.",
  "Some are transformed by microorganisms.",
  "Some act as signaling molecules.",
  "And some influence the environment in which our cells function.",
];

const science = [
  {
    Icon: Microscope,
    title: "The Microbiome",
    lead: "A new frontier in human health",
    text: "The human intestine contains an enormous microbial community that continuously interacts with the foods we consume, transforming dietary compounds into a wide range of metabolites.",
    chain: ["Food influences the microbiome.", "The microbiome transforms food.", "Microbial metabolites communicate with the human body."],
    close: "There is an entire biological ecosystem between food and human health.",
  },
  {
    Icon: Dna,
    title: "From Microbiome to Epigenetics",
    lead: "Systems that communicate continuously",
    text: "The genetic code itself may remain unchanged, while patterns of gene expression can respond to nutrition, metabolism, environmental signals and cellular conditions.",
    chain: [
      "Food influences the microbiome.",
      "The microbiome produces metabolites.",
      "Those metabolites can interact with metabolic, immune and cellular signaling pathways.",
    ],
    close: "It is an interconnected biological network — the heart of Foundational Medicine.",
  },
  {
    Icon: Zap,
    title: "Mitochondria & Cellular Energy",
    lead: "Every organ depends on cellular energy",
    text: "Mitochondrial activity is influenced by the metabolic environment in which cells exist — and that metabolic environment is strongly connected to nutrition.",
    chain: ["Muscles need it to contract.", "The brain needs it to communicate.", "The liver needs it for metabolism."],
    close: "The future of food should move beyond simply providing calories.",
  },
];

const connected = [
  "Food affects the digestive system",
  "The digestive system interacts with the microbiome",
  "The microbiome produces metabolites",
  "Metabolites communicate with cells",
  "Cells regulate metabolism, inflammation, energy and gene expression",
  "The condition of the whole body",
];

const whatIf = [
  "What if we began with excellent agricultural raw materials…",
  "preserved their natural character…",
  "used beneficial biological processes instead of relying unnecessarily on synthetic additives…",
  "and applied modern food science to improve quality, safety, flavor and stability?",
];

const principles = [
  {
    title: "Food as Medicine",
    not: "does not mean that ordinary food should be presented as a pharmaceutical treatment.",
    means: "It means recognizing that the foods we consume every day contribute to the biological environment in which our bodies function.",
  },
  {
    title: "Back to Nature",
    not: "does not mean rejecting technology.",
    means: "It means using technology intelligently to understand, preserve and enhance what nature already provides.",
  },
];

const elements = [
  ["Nature", "provides the biological diversity."],
  ["Traditional wisdom", "provides generations of observation."],
  ["Science", "helps us understand the mechanisms."],
  ["Technology", "helps us control quality and consistency."],
];

const futureLines = [
  "A Thai fruit.",
  "Grown from Thai soil.",
  "Developed through modern food biotechnology.",
  "Inspired by microbiome science.",
];

export default function FounderStory({ founderName }: { founderName: string }) {
  /* The document calls him "Dr. Patr" after the first mention */
  const short = founderName.split(/\s+/).slice(0, 2).join(" ");

  return (
    <>
      {/* More than 30 years with plants, herbs and human health */}
      <section aria-labelledby="thirty-years-heading" className="border-t border-cream bg-ivory px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={eyebrow}>The founder&apos;s journey</span>
            <TwoToneTitle id="thirty-years-heading" text="More Than 30 Years With Plants, Herbs and Human Health" accentWords={4} isbreak />
            <p className={`mt-6 ${body}`}>
              For more than three decades, {short} has worked with medicinal plants, Thai herbal formulations, food ingredients, botanical extracts, and the processing technologies required to transform natural raw materials into standardized products.
            </p>
            <p className={`mt-4 ${body}`}>
              His experience extends from traditional herbal knowledge to modern extraction, formulation, product development, quality control, and the study of biological mechanisms at the cellular and molecular levels.
            </p>
          </div>
          <figure className="rounded-3xl bg-white p-8 shadow-xl shadow-burgundy/5 md:p-10">
            <figcaption className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">At the center of this work is a fundamental question</figcaption>
            <blockquote className="mt-4 font-serif text-2xl leading-snug text-burgundy md:text-3xl">
              How can we preserve the intelligence of nature while using science and technology to make natural products more consistent, more accessible and more meaningful for modern life?
            </blockquote>
            <p className="mt-6 text-sm leading-7 text-muted">
              This question has guided much of his work in both medicine and food. It has also become one of the foundations behind Bangkok Mango.
            </p>
          </figure>
        </div>
      </section>

      {/* The founder of Foundational Medicine */}
      <section aria-labelledby="fm-heading" className="bg-burgundy px-6 py-20 text-white md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-gold">The founder of Foundational Medicine</span>
              <h2 id="fm-heading" className="font-serif text-3xl font-normal leading-tight md:text-4xl">
                <span className="block">Health as one</span>
                <span className="block text-gold">interconnected network</span>
              </h2>
              <p className="mt-6 text-sm leading-7 text-white/80 md:text-base md:leading-8">
                {short} is the founder of the Foundational Medicine Institute in Thailand, established to develop and share a systems-based approach to understanding health and chronic disease. It views the human body not as a collection of isolated organs, but as an interconnected biological network — seeking the deeper biological imbalances that may exist beneath symptoms.
              </p>
            </div>
            <div>
              <dl className="grid grid-cols-3 gap-4 rounded-3xl border border-white/15 bg-white/5 p-6 text-center md:p-8">
                {[
                  ["3", "Keys"],
                  ["9", "Steps"],
                  ["39", "Biological Axes"],
                ].map(([n, label]) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="block font-serif text-5xl text-gold md:text-6xl">{n}</span>
                      <span className="mt-2 block text-[11px] uppercase tracking-widest text-white/75">{label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm leading-7 text-white/80">
                A framework that integrates traditional medical knowledge with contemporary understanding of:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {systems.map((s) => (
                  <li key={s} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs text-white/85">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-14 border-t border-white/15 pt-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">The central principle is simple</p>
            <p className="mx-auto mt-3 max-w-3xl font-serif text-2xl leading-snug text-gold md:text-3xl">
              Sustainable health requires balance across the whole biological system.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70">
              This systems-thinking philosophy has influenced not only {short}&apos;s approach to medicine, but also the way he thinks about food.
            </p>
          </div>
        </div>
      </section>

      {/* Food & medicine never separate + food is biological information */}
      <section aria-labelledby="food-info-heading" className="bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <article className="rounded-3xl bg-ivory p-8 md:p-10">
            <span className={eyebrow}>Traditional Thai Medicine</span>
            <TwoToneTitle as="h3" text="Food and Medicine Were Never Truly Separate" accentWords={3} isbreak />
            <p className={`mt-6 ${body}`}>
              In Traditional Thai Medicine, food and medicine have historically existed on the same continuum. Food is not viewed only as a source of calories, and plants are not divided simply into &ldquo;food plants&rdquo; and &ldquo;medicinal plants&rdquo; — the same natural ingredient may serve different roles depending on how it is prepared, combined and consumed.
            </p>
            <p className={`mt-4 ${body}`}>
              Traditional Thai medical texts describe specific herbs incorporated into foods, soups and curries as part of the care of imbalances traditionally described in Thai medicine, including the broad category known as <em>Kasai</em>.
            </p>
            <p className="mt-6 border-l-4 border-accent pl-5 font-serif text-lg italic leading-snug text-burgundy md:text-xl">
              Food can become part of the therapeutic environment of the body.
            </p>
            <p className={`mt-4 ${body}`}>Modern science is now allowing us to explore this relationship at an entirely new level.</p>
          </article>

          <article className="rounded-3xl border border-cream p-8 md:p-10">
            <span className={eyebrow}>{short}&apos;s philosophy</span>
            <TwoToneTitle as="h3" id="food-info-heading" text="Food Is Biological Information" accentWords={2} isbreak />
            <p className={`mt-6 ${body}`}>
              Every meal introduces thousands of natural compounds into the human body. They interact with digestive enzymes, intestinal microorganisms, immune cells, metabolic pathways and cellular signaling systems.
            </p>
            <ul className="mt-6 space-y-3">
              {foodRoles.map((role) => (
                <li key={role} className="flex items-start gap-3 text-sm font-medium text-charcoal">
                  <Leaf aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {role}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-serif text-2xl text-burgundy">Food communicates with biology.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <p className="rounded-2xl bg-cream/60 p-4 text-sm text-muted">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Not only</span>
                &ldquo;What nutrients are present in this food?&rdquo;
              </p>
              <p className="rounded-2xl bg-gold/40 p-4 text-sm text-charcoal">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy">But also</span>
                &ldquo;How does this food interact with the biological networks of the human body?&rdquo;
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Microbiome · epigenetics · mitochondria */}
      <section aria-labelledby="science-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <span className={eyebrow}>Areas of interest &amp; research</span>
            <TwoToneTitle id="science-heading" text="The Science Behind the Philosophy" accentWords={2} isbreak />
          </div>
          <ul className="grid gap-6 lg:grid-cols-3">
            {science.map(({ Icon, title, lead, text, chain, close }) => (
              <li key={title} className="flex flex-col rounded-3xl bg-white p-7 shadow-lg shadow-burgundy/5 md:p-8">
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cream text-burgundy">
                  <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />
                </span>
                <h3 className="font-serif text-xl text-burgundy">{title}</h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{lead}</p>
                <p className="mt-4 text-sm leading-7 text-muted">{text}</p>
                <ol className="mt-5 space-y-2 border-l-2 border-mango/50 pl-4">
                  {chain.map((step) => (
                    <li key={step} className="text-sm font-medium text-charcoal">{step}</li>
                  ))}
                </ol>
                <p className="mt-auto pt-6 text-sm italic text-muted">{close}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* One connected biological system */}
      <section aria-labelledby="connected-heading" className="bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className={eyebrow}>At the heart of the philosophy</span>
            <TwoToneTitle id="connected-heading" text="One Connected Biological System" accentWords={2} isbreak />
            <p className={`mt-5 ${body}`}>Human biology cannot be divided into isolated pieces.</p>
          </div>
          <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {connected.map((step, i) => (
              <li key={step} className="relative flex flex-col items-center rounded-2xl bg-ivory px-4 py-6 text-center">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-gold">{i + 1}</span>
                <span className="text-sm font-medium leading-snug text-charcoal">{step}</span>
                {i < connected.length - 1 && (
                  <>
                    <ArrowRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-accent lg:block" />
                    <ArrowDown aria-hidden="true" className="mt-3 h-4 w-4 text-accent md:hidden" />
                  </>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center font-serif text-3xl text-burgundy">Everything is connected.</p>
          <p className={`mx-auto mt-4 max-w-2xl text-center ${body}`}>
            This is why the philosophy behind Bangkok Mango goes far beyond making dried fruit — a way of thinking rooted in traditional Thai wisdom, supported by modern biological science, and developed for the future.
          </p>
        </div>
      </section>

      {/* Medicinal plants → food biotechnology, and the Bangkok Mango idea */}
      <section aria-labelledby="biotech-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={eyebrow}>From medicinal plants</span>
            <TwoToneTitle id="biotech-heading" text="From Medicinal Plants to Food Biotechnology" accentWords={2} isbreak />
            <p className={`mt-6 ${body}`}>
              Plants are extraordinarily complex biological systems. A single fruit may contain hundreds or even thousands of naturally occurring compounds, and their biological characteristics can change depending on cultivation, maturity, processing, temperature, microorganisms and fermentation.
            </p>
            <p className="mt-6 border-l-4 border-accent pl-5 font-serif text-lg italic leading-snug text-burgundy md:text-xl">
              Food processing should not be considered merely a manufacturing step. It can also be a form of biological transformation.
            </p>
            <p className={`mt-6 ${body}`}>
              Fermentation is one of the clearest examples. Traditional cultures discovered its power thousands of years ago; modern microbiology now allows us to understand the processes behind it. This intersection has become an important part of {short}&apos;s work and the philosophy behind Bangkok Mango.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-burgundy/5 md:p-10">
            <span className={eyebrow}>The philosophy behind Bangkok Mango</span>
            <p className="font-serif text-xl leading-snug text-burgundy md:text-2xl">
              What if food could be developed using the same level of biological thinking that we apply to medicinal plants?
            </p>
            <ol className="mt-6 space-y-3">
              {whatIf.map((line, i) => (
                <li key={line} className="flex gap-4 text-sm leading-6 text-charcoal">
                  <span className="font-serif text-lg text-accent/60">{i + 1}</span>
                  {line}
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm leading-7 text-muted">
              The process begins with carefully selected mangoes. But the deeper concept comes from more than 30 years of understanding plants, herbal medicine, natural products and human biology —{" "}
              <strong className="font-semibold text-charcoal">the application of Foundational Medicine thinking to food innovation.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Food as Medicine — Back to Nature */}
      <section aria-labelledby="principles-heading" className="bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className={eyebrow}>Two interconnected ideas</span>
            <TwoToneTitle id="principles-heading" text="Food as Medicine — Back to Nature" accentWords={3} isbreak />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {principles.map(({ title, not, means }) => (
              <article key={title} className="rounded-3xl border border-cream bg-ivory p-8 md:p-10">
                <h3 className="font-serif text-2xl text-burgundy">&ldquo;{title}&rdquo;</h3>
                <p className="mt-4 text-sm leading-7 text-muted">&ldquo;{title}&rdquo; {not}</p>
                <p className="mt-3 text-base font-medium leading-7 text-charcoal">{means}</p>
              </article>
            ))}
          </div>
          <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-accent">
            For {short}, the future lies in combining both principles
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {elements.map(([term, def]) => (
              <div key={term} className="rounded-2xl bg-cream/60 p-6">
                <dt className="font-serif text-lg text-burgundy">{term}</dt>
                <dd className="mt-1 text-sm text-muted">{def}</dd>
              </div>
            ))}
          </dl>
          <p className={`mx-auto mt-8 max-w-2xl text-center ${body}`}>
            When these elements come together, food can evolve beyond simple nutrition — part of a more thoughtful approach to long-term health and biological balance.
          </p>
        </div>
      </section>

      {/* From Thai wisdom to the future of food */}
      <section aria-labelledby="future-heading" className="bg-burgundy px-6 py-20 text-white md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-gold">From Thai wisdom to the future of food</span>
            <h2 id="future-heading" className="font-serif text-3xl font-normal leading-tight md:text-4xl">
              <span className="block">One of the greatest opportunities</span>
              <span className="block text-gold">may be found in food.</span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-white/80 md:text-base md:leading-8">
              Not highly artificial food. Not food designed only for convenience. But food that begins with exceptional natural ingredients and is developed with a deeper understanding of biology. This is the philosophy that gave rise to Bangkok Mango.
            </p>
            <ul className="mt-8 space-y-2 font-serif text-xl text-white md:text-2xl">
              {futureLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-white/80">
              And guided by a belief that nature and science should not compete with each other.{" "}
              <span className="font-semibold text-gold">They should work together.</span>
            </p>
          </div>

          <figure className="rounded-3xl border border-white/15 bg-white/5 p-8 md:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">The founder&apos;s philosophy</p>
            <p className="mt-4 text-sm leading-7 text-white/80">
              More than three decades dedicated to understanding the relationship between:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {["Nature", "Food", "Plants", "Microorganisms", "Human Biology"].map((w) => (
                <li key={w} className="rounded-full bg-gold px-3.5 py-1.5 text-xs font-bold text-charcoal">{w}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-7 text-white/80">And transforming that knowledge into products for a healthier future.</p>
            <blockquote className="mt-8 space-y-1 border-t border-white/15 pt-8 font-serif text-2xl italic text-gold md:text-3xl">
              <p>Food as Medicine.</p>
              <p>Back to Nature.</p>
              <p>Restore Biological Balance.</p>
            </blockquote>
            <figcaption className="mt-6 text-xs font-bold uppercase tracking-widest text-white/80">
              — {founderName}, Founder, Bangkok Mango
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
