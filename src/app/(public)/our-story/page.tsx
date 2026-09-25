import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Beaker,
  Check,
  Droplets,
  FlaskConical,
  Leaf,
  MapPin,
  Microscope,
  PackageCheck,
  ShieldCheck,
  Sprout,
  Sun,
  Thermometer,
} from "lucide-react";
import CtaBanner from "@/components/public/CtaBanner";

/* Copy is transcribed from the brand's "Our Story" document (Mangobangkok.docx)
   and its ten-slide deck, including the document's SEO block: title, meta
   description and keywords. */

/* The brand's ten-slide "Our Story" deck (1600×900). Static page images, so
   they ship with the code in /public rather than living in the S3 bucket. */
const SLIDE_BASE = "/images/our-story";

interface Slide {
  number: number;
  src: string;
  alt: string;
  caption: string;
}

const slides = {
  story: {
    number: 1,
    src: `${SLIDE_BASE}/01-our-story.jpg`,
    caption: "Our Story",
    alt: "Bangkok Mango Our Story: Plum, Chili Lime and Passion Fruit dried mango pouches beside a plate of dried mango. Born in Thailand, perfected by nature and science — origin in Kui Buri, Kaew Kamin mango, very slow fermentation, clean drying and vacuum protection.",
  },
  kuiBuri: {
    number: 2,
    src: `${SLIDE_BASE}/02-kui-buri.jpg`,
    caption: "From Kui Buri, Thailand",
    alt: "From Kui Buri, Thailand: mango orchards below the mountains of Prachuap Khiri Khan, with biodiverse western Thailand, warm tropical climate, fertile soil, the Kaew Kamin variety and harvest at the right stage.",
  },
  traceability: {
    number: 3,
    src: `${SLIDE_BASE}/03-traceability.jpg`,
    caption: "Farm-to-pack traceability",
    alt: "Farm-to-pack traceability: GAP-based cultivation, selective harvesting, sorting, cleaning and preparation, quality control at every stage, traceable from orchard to pack.",
  },
  process: {
    number: 4,
    src: `${SLIDE_BASE}/04-fresh-to-finished.jpg`,
    caption: "From fresh mango to finished product",
    alt: "From fresh mango to finished product in seven steps, with the Bangkok Mango clean-label safety system.",
  },
  fermentation: {
    number: 5,
    src: `${SLIDE_BASE}/05-fermentation.jpg`,
    caption: "Where tradition meets biotechnology",
    alt: "Where tradition meets biotechnology: Thai Namwa banana substrate, beneficial cultures, very slow fermentation, transformed mango matrix, richer flavor and thoughtful processing.",
  },
  cleanLabel: {
    number: 6,
    src: `${SLIDE_BASE}/06-clean-label.jpg`,
    caption: "More than “no preservatives”",
    alt: "More than no preservatives: control of raw materials, microorganisms, fermentation, moisture and drying, hygiene and packaging.",
  },
  flavors1: {
    number: 7,
    src: `${SLIDE_BASE}/07-flavors-1.jpg`,
    caption: "Flavor Collection I",
    alt: "Flavor Collection I, fruit-forward signature flavors: Plum, Passion Fruit and Roselle dried mango pouches.",
  },
  flavors2: {
    number: 8,
    src: `${SLIDE_BASE}/08-flavors-2.jpg`,
    caption: "Flavor Collection II",
    alt: "Flavor Collection II, sweet, spicy and wellness-inspired flavors: Lychee, Chili Salt, Ginger and Turmeric dried mango pouches.",
  },
  flavors3: {
    number: 9,
    src: `${SLIDE_BASE}/09-flavors-3.jpg`,
    caption: "Flavor Collection III",
    alt: "Flavor Collection III, special selections: Beetroot and Chili Lime dried mango pouches and a plate of Original dried mango.",
  },
  difference: {
    number: 10,
    src: `${SLIDE_BASE}/10-difference.jpg`,
    caption: "The Bangkok Mango difference",
    alt: "The Bangkok Mango difference: Kui Buri origin, Kaew Kamin mango, very slow fermentation, inspired by science, clean-label process and vacuum protection.",
  },
} satisfies Record<string, Slide>;

export const metadata: Metadata = {
  title: "Bangkok Mango | Premium Thai Dried Mango with Fermentation Technology",
  description:
    "Discover Bangkok Mango, premium Thai dried mango from Kui Buri, Thailand, crafted from selected Kaew Kamin mangoes using controlled slow fermentation and modern food biotechnology.",
  keywords: [
    "Bangkok Mango",
    "Thai dried mango",
    "premium dried mango Thailand",
    "dried mango from Thailand",
    "Kaew Kamin mango",
    "fermented mango",
    "naturally fermented dried mango",
    "Thai mango",
    "premium Thai mango",
    "mango snack Thailand",
    "preservative-free dried mango",
    "no added preservatives dried mango",
    "microbiome food",
    "fermentation technology",
    "postbiotic fermentation",
    "tropical fruit Thailand",
    "Kui Buri mango",
    "Prachuap Khiri Khan mango",
  ],
  openGraph: {
    title: "Our Story | Bangkok Mango",
    description:
      "Born in Thailand. Perfected by Nature & Science. The origin, fermentation science and craft behind Bangkok Mango.",
    type: "article",
  },
};

const meetingPoints = [
  "Thai agriculture",
  "Tropical biodiversity",
  "Controlled fermentation",
  "Microbiome science",
  "Food biotechnology",
  "Craftsmanship",
];

const kaewKaminTraits = [
  ["Golden flesh", "A beautiful yellow-golden color develops through the fruit."],
  ["Firm & crisp", "Harvested at the right stage, the texture is firm, crisp and dense."],
  ["Balanced", "Brightness from natural acidity, followed by sweetness and a characteristic mango aroma."],
];

const traceSteps = [
  "GAP-based cultivation",
  "Selective harvesting",
  "Sorting, cleaning & preparation",
  "Quality control at every stage",
  "Traceable from orchard to pack",
];

const maturityEffects = ["Texture", "Acidity", "Sweetness", "Aroma", "Color", "Fermentation & drying behavior"];

const processSteps = [
  "Select Kaew Kamin mangoes",
  "Clean, trim and prepare",
  "Controlled fermentation / postbiotic conditioning",
  "Thoughtful seasoning",
  "Controlled drying",
  "Quality & safety testing",
  "Vacuum protection and final packaging",
];

const safetySystem = [
  "No added synthetic preservatives",
  "No artificial antifungal agents",
  "No unnecessary artificial antioxidants",
  "Microbiological and heavy metal testing",
  "Designed for stable color, aroma and flavor",
  "Shelf-stable for over 1 year when properly stored",
];

const fermentationChanges = [
  "Organic acids may be produced.",
  "Plant compounds may be transformed.",
  "Some bound compounds can become more accessible.",
  "The acidity of the food matrix can change.",
  "Flavor precursors can be generated.",
  "Entirely new sensory characteristics may emerge.",
];

const controls = [
  { Icon: Leaf, label: "Raw materials" },
  { Icon: Microscope, label: "Microorganisms" },
  { Icon: FlaskConical, label: "Fermentation" },
  { Icon: Beaker, label: "Acidity" },
  { Icon: Droplets, label: "Water activity & moisture" },
  { Icon: Thermometer, label: "Temperature" },
  { Icon: ShieldCheck, label: "Hygiene" },
  { Icon: PackageCheck, label: "Packaging" },
];

const collections = [
  {
    numeral: "I",
    title: "Fruit-forward signature flavors",
    slide: slides.flavors1,
    flavors: [
      ["Plum", "Sweet-tart and aromatic."],
      ["Passion Fruit", "Bright, tropical and lively."],
      ["Roselle", "Floral, tangy and distinctive."],
    ],
  },
  {
    numeral: "II",
    title: "Sweet, spicy and wellness-inspired flavors",
    slide: slides.flavors2,
    flavors: [
      ["Lychee", "Fragrant and softly sweet."],
      ["Chili Salt", "A bold sweet-salty-spicy bite."],
      ["Ginger", "Warm and aromatic."],
      ["Turmeric", "Earthy and golden."],
    ],
  },
  {
    numeral: "III",
    title: "Special selections and serving inspiration",
    slide: slides.flavors3,
    flavors: [
      ["Beetroot", "Vibrant color with a savory-sweet twist."],
      ["Chili Lime", "Zesty, spicy and refreshing."],
      ["Original", "Pure, naturally sweet and delicious."],
    ],
  },
];

const pathway = ["Orchard", "Selection", "Biological transformation", "Flavor development", "Controlled drying", "Protection"];

const differences = [
  {
    Icon: MapPin,
    title: "Selected Mangoes from Our Own Growing Region",
    body: [
      "Our story begins with mangoes grown in Kui Buri, Prachuap Khiri Khan. Working closely with the source allows us to control fruit maturity, selection criteria and traceability before processing begins.",
      "We believe premium dried mango must start with premium fresh mango. Processing cannot create quality that was never present in the fruit.",
    ],
  },
  {
    Icon: Sprout,
    title: "The Character of Kaew Kamin Mango",
    body: [
      "We select Kaew Kamin mango for its golden flesh, firm texture and characteristic balance of acidity and sweetness.",
      "That balance allows us to create dried mango with complexity. Not simply sugar. Not simply sourness. But layers of fruit flavor, aroma and texture.",
    ],
  },
  {
    Icon: FlaskConical,
    title: "Very Slow Fermentation",
    body: [
      "Our mangoes undergo a carefully controlled fermentation stage before drying. This allows biological and enzymatic transformation to take place within the food matrix.",
      "Rather than treating fermentation simply as preservation, we use it as a food-biotechnology platform to develop flavor and transform the fruit before dehydration.",
    ],
  },
  {
    Icon: Microscope,
    title: "Inspired by Postbiotic and Microbiome Science",
    body: [
      "Our fermentation philosophy is informed by modern research into beneficial microorganisms, fermented foods, microbial metabolites, postbiotics and the gut microbiome.",
      "The goal is to bring a new scientific dimension to traditional fruit processing while keeping the product fundamentally recognizable as real mango.",
    ],
  },
  {
    Icon: ShieldCheck,
    title: "No Added Synthetic Preservatives",
    body: [
      "Our production philosophy is centered on controlling the food environment through raw-material quality, fermentation, acidity, moisture management, drying, hygienic processing and protective packaging rather than depending primarily on conventional preservative systems.",
      "Our formulation is designed without added synthetic preservatives, artificial antifungal agents or unnecessary artificial antioxidants. Food safety remains non-negotiable: finished products are subjected to quality and safety controls, including appropriate microbiological and contaminant testing.",
    ],
  },
  {
    Icon: Sun,
    title: "Controlled Drying to Protect the Fruit",
    body: [
      "After fermentation and flavor development, the mango enters a controlled drying process. Drying is not simply about removing water — temperature, time and final moisture conditions influence texture, aroma, color and storage stability.",
      "Our process is designed to remove sufficient moisture for product stability while retaining the characteristic golden appearance, aroma and satisfying texture of the mango.",
    ],
  },
  {
    Icon: PackageCheck,
    title: "Protected Until the Moment You Open It",
    body: [
      "Once dried and quality checked, Bangkok Mango is packed in a protective packaging system designed to minimize exposure to oxygen and moisture — preserving the color, aroma, texture and flavor we have spent so much time creating.",
      "From orchard to fermentation, from drying to packaging, the process is designed as a single continuous quality system.",
    ],
  },
];

const journey = [
  "A mango whose journey can be traced back to the orchard.",
  "A mango selected for its natural character.",
  "A mango transformed through fermentation.",
  "A mango carefully dried and protected.",
];

/* Shared type scale so the long-form sections stay consistent. */
const eyebrow = "mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-beetroot";
const h2 = "text-3xl font-medium leading-tight tracking-tight md:text-5xl";
const body = "text-sm leading-7 text-muted md:text-base md:leading-8";

/* One slide of the deck, shown whole (never cropped — the slides carry text).
   Clicking opens the full-size image so the small print stays readable. */
function StorySlide({
  slide,
  tone = "light",
  preload = false,
  className = "",
}: {
  slide: Slide;
  tone?: "light" | "dark";
  preload?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <figure className={`mx-auto max-w-6xl ${className}`}>
      <a
        href={slide.src}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block overflow-hidden rounded-2xl border shadow-xl ${
          dark ? "border-white/15 shadow-black/30" : "border-cream shadow-burgundy/10"
        }`}
      >
        <Image
          src={slide.src}
          alt={slide.alt}
          width={1600}
          height={900}
          preload={preload}
          sizes="(max-width: 1199px) calc(100vw - 48px), 1152px"
          className="h-auto w-full transition duration-500 group-hover:scale-[1.01]"
        />
      </a>
      <figcaption
        className={`mt-3 flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] ${
          dark ? "text-white/60" : "text-muted"
        }`}
      >
        <span>{slide.caption}</span>
        <span>{String(slide.number).padStart(2, "0")} / 10</span>
      </figcaption>
    </figure>
  );
}

export default function OurStoryPage() {
  return (
    <main>
      {/* Hero */}
      <section className="overflow-hidden bg-burgundy px-6 pb-16 pt-12 text-white md:px-12 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-3 text-xs text-white/65">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">Our Story</span>
          </nav>
          <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <h1>
              <span className="mb-5 block text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
                Our Story: The Science, Nature and Origin Behind Bangkok Mango
              </span>
              <span className="block text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl">
                Born in Thailand.<br />
                <span className="text-gold">Perfected by Nature &amp; Science.</span>
              </span>
            </h1>
            <div>
              <p className="text-sm leading-7 text-white/80 md:text-base">
                At Bangkok Mango, we believe that extraordinary food begins long before it reaches the table. It begins with the land — and a ten-part journey from orchard to finished product.
              </p>
              <a
                href="#the-idea"
                className="mt-7 inline-flex w-fit items-center gap-4 rounded-full border border-white/30 px-6 py-4 text-xs font-semibold uppercase tracking-widest transition hover:bg-white hover:text-burgundy"
              >
                Read our story <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
          <StorySlide slide={slides.story} tone="dark" preload className="mt-12" />
        </div>
      </section>

      {/* The idea */}
      <section id="the-idea" aria-labelledby="idea-heading" className="scroll-mt-28 bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <span className={eyebrow}>Where it begins</span>
            <h2 id="idea-heading" className={h2}>It begins with the land.</h2>
            <p className={`mt-6 ${body}`}>
              It begins with the variety of fruit we choose to grow, the soil beneath its roots, the climate surrounding the orchard, the moment the fruit is harvested, and the way nature is respected throughout every stage of cultivation.
            </p>
            <p className={`mt-4 ${body}`}>But for us, that is only the beginning.</p>
          </div>
          <div>
            <p className="mb-5 text-sm font-semibold">Bangkok Mango was created from a simple idea:</p>
            <blockquote className="border-l-4 border-accent pl-6 text-xl font-medium leading-relaxed tracking-tight md:text-2xl">
              What if one of Thailand&apos;s most beloved fruits could be transformed into something more — not by overwhelming nature with additives, but by combining traditional food wisdom with modern biological science?
            </blockquote>
            <p className={`mt-6 ${body}`}>
              That question became the foundation of Bangkok Mango. Today, our premium Thai dried mango represents the meeting point of:
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {meetingPoints.map((point) => (
                <li key={point} className="rounded-full border border-cream bg-white px-4 py-2 text-xs font-semibold">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-4xl rounded-2xl bg-cream px-8 py-10 text-center md:px-14 md:py-12">
          <p className={body}>
            From our mango orchards in Kui Buri, Prachuap Khiri Khan, to our carefully controlled fermentation and drying process, every step has one purpose:
          </p>
          <p className="mt-4 text-xl font-medium leading-snug tracking-tight md:text-3xl">
            To preserve what nature created — and allow science to bring out even more of its potential.
          </p>
        </div>
      </section>

      {/* From Kui Buri + Kaew Kamin */}
      <section aria-labelledby="origin-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className={eyebrow}>From Kui Buri, Thailand</span>
            <h2 id="origin-heading" className={h2}>Quality begins in the orchard.</h2>
          </div>
          <div>
            <p className={body}>
              Our story begins in Kui Buri District, Prachuap Khiri Khan Province, on Thailand&apos;s western peninsula. This region lies alongside one of the country&apos;s great forest landscapes, an area recognized for its remarkable biological diversity.
            </p>
            <p className={`mt-4 ${body}`}>
              Tropical warmth, balanced seasonal rainfall, fertile soil and local ecology provide an exceptional setting for cultivating mangoes.
            </p>
          </div>
        </div>
        <StorySlide slide={slides.kuiBuri} className="mt-12" />

        <div className="mx-auto mt-20 max-w-7xl">
          <div className="mb-10 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>The heart of Bangkok Mango</span>
              <h3 className="text-2xl font-medium leading-tight tracking-tight md:text-4xl">Kaew Kamin Mango</h3>
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              A distinctive golden-fleshed mango cultivated in Thailand and valued for characteristics that make it particularly interesting for premium fruit processing. It is not simply sweet — its character comes from contrast.
            </p>
          </div>
          <dl className="grid gap-5 md:grid-cols-3">
            {kaewKaminTraits.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-cream bg-ivory p-7">
                <dt className="mb-2 text-lg font-medium tracking-tight">{title}</dt>
                <dd className="text-sm leading-7 text-muted">{description}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-10 max-w-3xl ${body}`}>
            For Bangkok Mango, this balance matters. A truly exceptional dried mango cannot be created by drying an ordinary fruit and adding sweetness afterward.{" "}
            <strong className="font-semibold text-charcoal">The quality must already exist inside the mango.</strong>{" "}
            That is why our process begins in the orchard.
          </p>
        </div>
      </section>

      {/* Farm-to-pack traceability */}
      <section aria-labelledby="trace-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className={eyebrow}>Farm-to-pack traceability</span>
            <h2 id="trace-heading" className={h2}>Harvest is the first stage of food processing.</h2>
          </div>
          <div>
            <p className={body}>
              Our mangoes are cultivated under carefully managed agricultural practices based on Good Agricultural Practices — GAP principles. From orchard management and harvesting to fruit selection and processing, our objective is to maintain consistency, safety and traceability throughout the supply chain.
            </p>
            <p className={`mt-4 ${body}`}>
              Each harvest is selected at an appropriate stage of maturity, because maturity affects almost everything that follows:
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {maturityEffects.map((effect) => (
                <li key={effect} className="rounded-full bg-cream px-4 py-2 text-xs font-semibold">
                  {effect}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ol aria-label="Traceability steps" className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center gap-3">
          {traceSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="rounded-full border border-cream bg-white px-4 py-2 text-xs font-semibold">{step}</span>
              {i < traceSteps.length - 1 && <ArrowRight aria-hidden="true" className="h-4 w-4 text-accent" />}
            </li>
          ))}
        </ol>
        <StorySlide slide={slides.traceability} className="mt-12" />
      </section>

      {/* From fresh mango to finished product */}
      <section aria-labelledby="process-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>From fresh mango to finished product</span>
              <h2 id="process-heading" className={h2}>A clean, controlled process from orchard to pack.</h2>
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              The fruit is selected, inspected, cleaned and prepared according to our quality-control procedures before entering the most distinctive part of the Bangkok Mango process.
            </p>
          </div>
          <StorySlide slide={slides.process} />
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <ol className="rounded-2xl border border-cream bg-ivory p-7 md:p-9">
              {processSteps.map((step, i) => (
                <li key={step} className="flex items-baseline gap-4 border-b border-cream py-3 last:border-0">
                  <span className="w-6 shrink-0 text-lg font-light text-beetroot/50">{i + 1}</span>
                  <span className="text-sm font-medium">{step}</span>
                </li>
              ))}
            </ol>
            <div className="rounded-2xl bg-burgundy p-7 text-white md:p-9">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Clean-label safety system</p>
              <ul className="space-y-3">
                {safetySystem.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/85">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Where tradition meets biotechnology */}
      <section aria-labelledby="ferment-heading" className="bg-beetroot px-6 py-20 text-white md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Where tradition meets biotechnology</span>
              <h2 id="ferment-heading" className={h2}>Our Very Slow Fermentation Process</h2>
              <p className="mt-6 text-sm leading-7 text-white/80 md:text-base md:leading-8">
                Fermentation is one of humanity&apos;s oldest food technologies. Long before modern laboratories existed, people discovered that microorganisms could transform food — changing its flavor, aroma, texture, stability and nutritional characteristics. Today, science allows us to understand these transformations at a much deeper level.
              </p>
            </div>
            <div className="space-y-4 text-sm leading-7 text-white/80 md:text-base md:leading-8">
              <p>
                Bangkok Mango brings this ancient principle into modern food biotechnology. Our fermentation culture begins with selected beneficial microorganisms cultivated using{" "}
                <strong className="font-semibold text-gold">Thai Namwa banana</strong> as part of the fermentation substrate.
              </p>
              <p>
                Rather than rushing the process, we allow microbial and enzymatic transformation to occur under carefully controlled conditions. Microorganisms interact with nutrients naturally present in the plant material and generate a complex fermentation environment containing microbial metabolites and transformed food compounds.
              </p>
              <p>
                These may include naturally formed organic acids and other fermentation-derived metabolites, while enzymatic transformation can also alter the accessibility of plant nutrients and phytochemicals.
              </p>
            </div>
          </div>
          <StorySlide slide={slides.fermentation} tone="dark" className="mt-14" />
          <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7 md:p-9">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">More than preservation</p>
              <p className="text-xl font-medium leading-snug tracking-tight">Fermentation can transform the food matrix itself.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7 text-sm leading-7 text-white/80 md:p-9">
              Scientific reviews have reported that lactic-acid-bacteria fermentation of fruits and vegetables can influence phenolic compounds, antioxidant activity, bioaccessibility, sensory characteristics and storage stability. Research specifically involving fermented mango products has also demonstrated measurable changes in phenolic compounds, carotenoids and antioxidant characteristics after fermentation and simulated digestion.
            </div>
          </div>
        </div>
      </section>

      {/* Probiotic → postbiotic */}
      <section aria-labelledby="postbiotic-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>From probiotic fermentation to postbiotic science</span>
              <h2 id="postbiotic-heading" className={h2}>Food is also a biological environment.</h2>
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              The human digestive system is home to a vast microbial ecosystem known as the gut microbiome. Modern research no longer views food only in terms of calories, carbohydrates, proteins, fats, vitamins and minerals — but as something that interacts with microbial communities and their metabolism.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-cream bg-white p-7 md:p-9">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-beetroot">Probiotics</p>
              <p className="text-sm leading-7 text-muted">Involve live microorganisms with demonstrated health benefits.</p>
            </div>
            <div className="rounded-2xl border border-cream bg-white p-7 md:p-9">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-beetroot">Postbiotics</p>
              <p className="text-sm leading-7 text-muted">
                Involve inactivated microorganisms and/or their components, potentially together with microbial metabolites, where a health benefit has been demonstrated.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">As distinguished by international scientific consensus.</p>
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <p className={body}>
              For Bangkok Mango, this science inspires the design of our fermentation platform. Rather than depending on live microorganisms remaining active in the final dried product, our process focuses on the biological transformation that takes place during fermentation and the compounds generated through that process. It is a fundamentally different philosophy from simply coating fruit with flavor and drying it.
            </p>
            <p className="text-3xl font-medium leading-tight tracking-tight text-accent md:text-4xl lg:text-right">
              We transform first.<br />Then we dry.
            </p>
          </div>
        </div>
      </section>

      {/* Why fermentation matters */}
      <section aria-labelledby="why-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <span className={eyebrow}>Why fermentation matters</span>
            <h2 id="why-heading" className={h2}>During fermentation, complex biological reactions occur.</h2>
          </div>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fermentationChanges.map((change, i) => (
              <li key={change} className="rounded-2xl border border-cream bg-ivory p-7">
                <span className="mb-4 block text-3xl font-light tracking-tight text-beetroot/35">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-base font-medium leading-snug tracking-tight">{change}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
            <p className={body}>
              This is why fermentation has played such an important role in human food culture for thousands of years. An international scientific consensus on fermented foods notes that microbial growth and enzymatic conversion during fermentation can modify raw ingredients, generate biologically active compounds and alter nutritional characteristics. More recent literature on lactic acid fermentation of fruits and vegetables has described its potential to improve the bioaccessibility of some phenolic antioxidants and to enhance characteristics related to food quality and stability.
            </p>
            <div>
              <p className={body}>
                This is especially interesting in mango. Studies of fermented mango products have reported changes in total phenolic compounds, antioxidant properties and bioaccessibility after fermentation. These findings do not mean that every fermented mango product will produce the same biological effects in humans, but they provide a strong scientific rationale for studying fermentation as a way of creating the next generation of fruit products.
              </p>
              <p className="mt-6 text-lg font-medium tracking-tight">For Bangkok Mango, that next generation begins here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Food, microbiome and the future of health */}
      <section aria-labelledby="health-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={eyebrow}>Food, microbiome and the future of health</span>
            <h2 id="health-heading" className={h2}>Built on science. Honest about it.</h2>
            <p className={`mt-6 ${body}`}>
              One of the most exciting areas of modern nutritional science is the relationship between diet, the gut microbiome and human physiology. The gut microbiota participates in metabolic and immune functions and produces numerous compounds capable of communicating with human cells — microbial metabolites such as short-chain fatty acids, organic acids and other signaling molecules are an increasingly important field of biomedical research.
            </p>
            <p className={`mt-4 ${body}`}>
              In a controlled dietary study published in <em>Cell</em>, a diet rich in fermented foods was associated with increased microbiome diversity and reductions in several inflammatory markers during the intervention. Importantly, this evidence applies to the studied fermented-food diet as a whole and should not be interpreted as proof of the same clinical effect from any individual fermented product.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-cream p-8 md:p-12">
            <p className={body}>This distinction is important to us. Bangkok Mango is built on science, but science also teaches us not to exaggerate.</p>
            <p className="mt-8 text-lg font-medium text-muted md:text-xl">Our objective is not to turn mango into medicine.</p>
            <p className="mt-2 text-3xl font-medium leading-tight tracking-tight md:text-4xl">Our objective is to create better food.</p>
            <p className={`mt-6 ${body}`}>
              Food designed with a deeper understanding of nature, fermentation, microbiology and human biology.
            </p>
          </div>
        </div>
      </section>

      {/* More than "no preservatives" */}
      <section aria-labelledby="control-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={eyebrow}>More than &ldquo;no preservatives&rdquo;</span>
            <h2 id="control-heading" className={h2}>A clean-label philosophy built into the process.</h2>
            <p className={`mt-6 ${body}`}>
              For us, clean-label food should mean more than removing something from an ingredient list. It should mean designing the entire process intelligently enough that unnecessary additives are not required.
            </p>
            <p className={`mt-4 ${body}`}>
              That requires control — and continuous verification of food safety. This is the difference between simply saying &ldquo;no preservatives&rdquo; and building a food-processing technology designed around that principle from the beginning.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4">
            {controls.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-4 rounded-2xl border border-cream bg-ivory p-5">
                <Icon aria-hidden="true" className="h-6 w-6 shrink-0 text-beetroot" strokeWidth={1.5} />
                <span className="text-sm font-medium">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Control of</span>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <StorySlide slide={slides.cleanLabel} className="mt-14" />
      </section>

      {/* Flavor collections */}
      <section aria-labelledby="flavors-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>Our flavor collections</span>
              <h2 id="flavors-heading" className={h2}>Premium dried mango with Thai character.</h2>
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              Every flavor starts from the same Kaew Kamin mango and the same careful process — then takes on a character of its own. Three or four strips make a serving.
            </p>
          </div>
          <div className="space-y-20">
            {collections.map(({ numeral, title, slide, flavors }) => (
              <article key={numeral} aria-labelledby={`collection-${numeral}`}>
                <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-beetroot">Collection {numeral}</span>
                  <h3 id={`collection-${numeral}`} className="text-2xl font-medium tracking-tight md:text-3xl">{title}</h3>
                </div>
                <StorySlide slide={slide} />
                <dl className={`mt-6 grid gap-4 sm:grid-cols-2 ${flavors.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                  {flavors.map(([name, description]) => (
                    <div key={name} className="rounded-2xl border border-cream bg-white p-5">
                      <dt className="text-base font-semibold tracking-tight">{name}</dt>
                      <dd className="mt-1 text-sm text-muted">{description}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 rounded-full bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-accent"
            >
              Shop the flavors <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Bangkok Mango difference */}
      <section aria-labelledby="difference-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>The Bangkok Mango difference</span>
              <h2 id="difference-heading" className={h2}>Not simply dried mango.</h2>
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              Most dried-fruit production follows a relatively simple pathway: fruit is prepared, sweetness or processing aids may be added, and the fruit is dried. Bangkok Mango approaches the process differently.
            </p>
          </div>
          <ol aria-label="Our process pathway" className="mb-14 flex flex-wrap items-center gap-x-3 gap-y-3">
            {pathway.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="rounded-full bg-burgundy px-4 py-2 text-xs font-semibold text-white">{step}</span>
                {i < pathway.length - 1 && <ArrowRight aria-hidden="true" className="h-4 w-4 text-accent" />}
              </li>
            ))}
          </ol>
          <StorySlide slide={slides.difference} className="mb-14" />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {differences.map(({ Icon, title, body: paragraphs }, i) => (
              <li key={title} className="rounded-2xl border border-cream bg-ivory p-7 md:p-9">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-4xl font-light tracking-tight text-beetroot/35">{String(i + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" className="h-6 w-6 text-beetroot" strokeWidth={1.5} />
                </div>
                <h3 className="mb-4 text-xl font-medium tracking-tight">{title}</h3>
                {paragraphs.map((p) => (
                  <p key={p} className="mt-3 text-sm leading-7 text-muted">{p}</p>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Nature created the mango */}
      <section aria-labelledby="nature-heading" className="bg-burgundy px-6 py-20 text-white md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Two worlds, one mango</span>
            <h2 id="nature-heading" className={h2}>Nature created the mango. Science helps us respect it.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-8 md:p-10">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">One world is ancient</p>
              <p className="text-sm leading-7 text-white/80 md:text-base">
                The world of Thai agriculture, orchards, tropical fruits, fermentation and traditional understanding of food.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-8 md:p-10">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">The other world is modern</p>
              <p className="text-sm leading-7 text-white/80 md:text-base">
                The world of microbiology, metabolomics, microbiome research, fermentation science, food engineering and precision quality control.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-14 max-w-2xl text-center text-sm leading-7 text-white/80 md:text-base md:leading-8">
            <p>We do not believe these worlds compete with one another. We believe they belong together. Because the future of food may not come from replacing nature.</p>
            <p className="mt-4 text-2xl font-medium tracking-tight text-gold md:text-3xl">It may come from understanding nature more deeply.</p>
          </div>
        </div>
      </section>

      {/* From Thailand to the world */}
      <section aria-labelledby="world-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
            <Image
              src="/images/processing/bangkok-mango-packing.webp"
              alt="Gold and ivory Bangkok Mango Original Flavor pouches beside dried mango and a packing scoop"
              fill
              sizes="(max-width: 1023px) 100vw, 600px"
              className="object-cover"
            />
          </div>
          <div>
            <span className={eyebrow}>From Thailand to the world</span>
            <h2 id="world-heading" className={h2}>This is Bangkok Mango.</h2>
            <p className={`mt-6 ${body}`}>
              Thailand is recognized around the world for the extraordinary diversity of its tropical fruits. Bangkok Mango was created to take that heritage one step further — so the world can experience Thai mango not simply as another dried-fruit snack, but as a premium food created through the combination of Thai origin, agricultural craftsmanship and modern biological science.
            </p>
            <ul className="mt-8 divide-y divide-cream border-y border-cream">
              {journey.map((line) => (
                <li key={line} className="py-4 text-sm font-medium">{line}</li>
              ))}
            </ul>
            <p className={`mt-6 ${body}`}>
              A mango that represents both where Thai food comes from and where Thai food innovation is going next.
            </p>
          </div>
        </div>
      </section>

      <CtaBanner
        eyebrow="Born in Thailand. Perfected by Nature & Science."
        title="From our orchard to the world."
        description="Taste the result of Kui Buri fruit, very slow fermentation and careful drying — real Thai mango, transformed first, then dried."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="See Our Process"
        secondaryHref="/processing"
      />
    </main>
  );
}
