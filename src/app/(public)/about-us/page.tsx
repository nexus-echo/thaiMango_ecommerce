import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Beaker,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  FlaskConical,
  HandHeart,
  Heart,
  Leaf,
  Microscope,
  Mountain,
  PackageCheck,
  Quote,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  Users,
} from "lucide-react";
import CtaBanner from "@/components/public/CtaBanner";
import StorySlide, { type Slide } from "@/components/public/StorySlide";
import TwoToneTitle from "@/components/public/TwoToneTitle";
import FounderStory from "@/components/public/FounderStory";
import { prisma } from "@/lib/prismaClient";
import { normalizeImagePath } from "@/lib/images";
import { siteContentDefault } from "@/schemas/siteContent.schema";

/* About Us: the product (origin, traceability, clean label — moved here from
   /our-story, which keeps the fermentation science), the pack's USPs and the
   founder. Copy is from the brand document (Mangobangkok.docx) and slides
   2, 3 and 6 of the "Our Story" deck. Founder photo/name/quote/highlights are
   the admin-editable Site Content blocks the home page uses. */

export const metadata: Metadata = {
  title: "About Us | Bangkok Mango — Premium Thai Dried Mango from Kui Buri",
  description:
    "Meet Bangkok Mango: Kaew Kamin mangoes from Kui Buri, Thailand, farm-to-pack traceability, a clean-label process and the founder behind it, Dr. Patr Nangsue.",
  openGraph: {
    title: "About Us | Bangkok Mango",
    description: "Born in Thailand. Perfected by Nature & Science. The product, the promise and the founder behind Bangkok Mango.",
    type: "website",
  },
};

/* Founder blocks are edited in Admin → Site Content; re-read every 5 minutes. */
export const revalidate = 300;

const FOUNDER_IDS = [
  "founder_image",
  "founder_name",
  "founder_quote",
  "founder_point1_title",
  "founder_point1_text",
  "founder_point2_title",
  "founder_point2_text",
];

async function founderContent(): Promise<(id: string) => string> {
  try {
    const rows = await prisma.siteContent.findMany({
      where: { id: { in: FOUNDER_IDS } },
      select: { id: true, content: true },
    });
    const byId = new Map(rows.map((r) => [r.id, r.content.trim()]));
    return (id) => byId.get(id) || siteContentDefault(id);
  } catch (error) {
    console.error("About page: site content unavailable, using defaults:", error);
    return siteContentDefault;
  }
}

const SLIDE_BASE = "/images/our-story";
const slides = {
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
  cleanLabel: {
    number: 6,
    src: `${SLIDE_BASE}/06-clean-label.jpg`,
    caption: "More than “no preservatives”",
    alt: "More than no preservatives: control of raw materials, microorganisms, fermentation, moisture and drying, hygiene and packaging.",
  },
} satisfies Record<string, Slide>;

/* Mango outline — lucide has no mango (same drawing as the home trust badges). */
function MangoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8" />
      <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z" />
      <path d="M10 4.5c1-1.5 2-2 3-2" />
    </svg>
  );
}

function ThaiFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 36" className={className} aria-hidden="true">
      <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
      <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
      <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
    </svg>
  );
}

/* Slide 2's origin pillars */
const origin = [
  { Icon: Mountain, label: "Biodiverse Western Thailand" },
  { Icon: Sun, label: "Warm Tropical Climate" },
  { Icon: Sprout, label: "Fertile Soil" },
  { Icon: MangoIcon, label: "Kaew Kamin Variety" },
  { Icon: HandHeart, label: "Harvested at the Right Stage" },
];

const kaewKaminTraits = [
  ["Golden flesh", "A beautiful yellow-golden color develops through the fruit."],
  ["Firm & crisp", "Harvested at the right stage, the texture is firm, crisp and dense."],
  ["Balanced", "Brightness from natural acidity, followed by sweetness and a characteristic mango aroma."],
];

/* Slide 3's traceability flow */
const traceSteps = [
  { Icon: Sprout, label: "GAP-based cultivation" },
  { Icon: MangoIcon, label: "Selective harvesting" },
  { Icon: Droplets, label: "Sorting, cleaning & preparation" },
  { Icon: ClipboardCheck, label: "Quality control at every stage" },
  { Icon: PackageCheck, label: "Traceable from orchard to pack" },
];

const maturityEffects = ["Texture", "Acidity", "Sweetness", "Aroma", "Color", "Fermentation & drying behavior"];

/* Slide 6's controls, plus acidity and temperature from the brand document */
const controls = [
  { Icon: Leaf, label: "Raw materials" },
  { Icon: Microscope, label: "Microorganisms" },
  { Icon: FlaskConical, label: "Fermentation" },
  { Icon: Beaker, label: "Acidity" },
  { Icon: Droplets, label: "Moisture & drying" },
  { Icon: Thermometer, label: "Temperature" },
  { Icon: ShieldCheck, label: "Hygiene" },
  { Icon: PackageCheck, label: "Packaging" },
];

/* The promises printed on every pack (slide 3's badge bar + the home trust pillars) */
const usps = [
  { Icon: Leaf, th: "ธรรมชาติ 100%", en: "100% Natural", text: "Pure natural fruit with no added synthetic preservatives." },
  { Icon: MangoIcon, th: "คัดสรรจากมะม่วงคุณภาพ", en: "Finest Quality Thai Mango", text: "Kaew Kamin mangoes selected at the right stage of maturity." },
  { Icon: ThaiFlag, th: "ผลิตในประเทศไทย", en: "Product of Thailand", text: "Grown in Kui Buri, produced and packed in Thailand." },
  { Icon: Heart, th: "อร่อย เพลิน เคี้ยวหนึบ", en: "Delicious & Chewy", text: "Controlled drying keeps the soft, satisfying chew." },
  { Icon: Users, th: "เหมาะสำหรับทุกวัย", en: "For All Ages", text: "A wholesome snack for kids and adults alike." },
];

const credentials = [
  "Thai Traditional Medicine Practitioner",
  "Researcher in Medicinal Plants, Natural Products & Microbiome Science",
  "Founder, Foundational Medicine Institute",
];

const eyebrow = "mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-accent";
const body = "text-sm leading-7 text-muted md:text-base md:leading-8";

/* The slides' gold brush-stroke tagline */
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-8 inline-flex -rotate-1 items-center gap-3 rounded-sm bg-linear-to-r from-gold via-gold/80 to-gold/20 px-5 py-3 font-serif text-lg italic text-charcoal md:text-xl">
      <Leaf aria-hidden="true" className="h-5 w-5 shrink-0 text-burgundy" />
      {children}
    </p>
  );
}

export default async function AboutUsPage() {
  const content = await founderContent();
  const founderName = content("founder_name");

  return (
    <main>
      {/* Hero — the Kui Buri orchards */}
      <section className="relative isolate overflow-hidden bg-burgundy px-6 pb-20 pt-12 text-white md:px-12 md:pb-28 md:pt-16">
        <Image
          src="/images/sample_2.webp"
          alt=""
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/55 to-black/10" />
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-14 flex items-center gap-3 text-xs text-white/70">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">About Us</span>
          </nav>
          <div className="max-w-2xl">
            <h1>
              <span className="mb-5 block text-[11px] font-bold uppercase tracking-[0.3em] text-gold">About Bangkok Mango</span>
              <span className="block font-serif text-4xl font-normal leading-[1.1] md:text-6xl">
                Born in Thailand.
                <span className="block text-gold">Perfected by Nature &amp; Science.</span>
              </span>
            </h1>
            <p className="mt-6 text-sm leading-7 text-white/85 md:text-base md:leading-8">
              At Bangkok Mango, we believe that extraordinary food begins long before it reaches the table. It begins with the land — the variety of fruit we choose to grow, the soil beneath its roots, the moment the fruit is harvested — and with a founder who has spent more than 30 years learning how nature and the human body work together.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {[
                ["#product", "The Product"],
                ["#promise", "Our Promise"],
                ["#founder", "Our Founder"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition hover:bg-white hover:text-burgundy"
                  >
                    {label} <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── About the product ── */}

      {/* From Kui Buri, Thailand + Kaew Kamin */}
      <section id="product" aria-labelledby="origin-heading" className="scroll-mt-28 bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className={eyebrow}>About the product</span>
            <TwoToneTitle id="origin-heading" text="From Kui Buri, Thailand" accentWords={1} isbreak />
            <p className="mt-3 font-serif text-lg italic text-muted">Origin, biodiversity and the mango behind our story.</p>
            <p className={`mt-6 ${body}`}>
              Bangkok Mango begins in Kui Buri District, Prachuap Khiri Khan Province, on Thailand&apos;s western peninsula. This region lies alongside one of the country&apos;s great forest landscapes, an area recognized for its remarkable biological diversity.
            </p>
            <p className={`mt-4 ${body}`}>
              Tropical warmth, balanced seasonal rainfall, fertile soil and local ecology provide an exceptional setting for cultivating mangoes.
            </p>
            <Callout>Quality begins in the orchard.</Callout>
          </div>
          <figure className="relative aspect-3/2 overflow-hidden rounded-3xl shadow-2xl shadow-burgundy/15">
            <Image
              src="/images/processing/mango-selection.webp"
              alt="A wooden crate of ripe golden Kaew Kamin mangoes with fresh mango leaves"
              fill
              sizes="(max-width: 1023px) calc(100vw - 48px), 560px"
              className="object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-ivory/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy backdrop-blur-sm">
              Kaew Kamin mango · Kui Buri
            </figcaption>
          </figure>
        </div>

        <ul className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {origin.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/60 bg-white text-burgundy shadow-sm">
                <Icon className="h-7 w-7" />
              </span>
              <span className="max-w-36 font-serif text-sm font-semibold leading-snug text-burgundy">{label}</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-20 max-w-6xl">
          <div className="mb-10 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>The heart of Bangkok Mango</span>
              <TwoToneTitle as="h3" text="Kaew Kamin Mango" accentWords={1} />
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              A distinctive golden-fleshed mango cultivated in Thailand and valued for characteristics that make it particularly interesting for premium fruit processing. It is not simply sweet — its character comes from contrast.
            </p>
          </div>
          <dl className="grid gap-5 md:grid-cols-3">
            {kaewKaminTraits.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-cream bg-white p-7">
                <dt className="mb-2 font-serif text-lg text-burgundy">{title}</dt>
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
        <StorySlide slide={slides.kuiBuri} className="mt-14" />
      </section>

      {/* Farm-to-pack traceability */}
      <section aria-labelledby="trace-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className={eyebrow}>Farm-to-pack traceability</span>
              <TwoToneTitle id="trace-heading" text="Farm-to-Pack Traceability" accentWords={1} isbreak />
              <p className="mt-3 font-serif text-lg italic text-muted">Careful control from orchard to processing.</p>
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

          <ol aria-label="Traceability steps" className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {traceSteps.map(({ Icon, label }, i) => (
              <li key={label} className="relative flex flex-col items-center text-center">
                {i < traceSteps.length - 1 && (
                  <ChevronRight aria-hidden="true" className="absolute -right-4 top-9 hidden h-6 w-6 text-accent lg:block" />
                )}
                <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-ivory text-burgundy ring-1 ring-cream">
                  <Icon className="h-9 w-9" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Step {i + 1}</span>
                <span className="mt-1 max-w-40 text-sm font-semibold leading-snug text-charcoal">{label}</span>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <Callout>Harvest is the first stage of food processing.</Callout>
          </div>
        </div>
        <StorySlide slide={slides.traceability} className="mt-14" />
      </section>

      {/* More than "no preservatives" */}
      <section aria-labelledby="control-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={eyebrow}>Our clean-label philosophy</span>
            <TwoToneTitle id="control-heading" text="More Than “No Preservatives”" isbreak />
            <p className="mt-3 font-serif text-lg italic text-muted">A clean-label philosophy built into the process.</p>
            <p className={`mt-6 ${body}`}>
              For us, clean-label food should mean more than removing something from an ingredient list. It should mean designing the entire process intelligently enough that unnecessary additives are not required.
            </p>
            <p className={`mt-4 ${body}`}>
              That requires control — and continuous verification of food safety. This is the difference between simply saying &ldquo;no preservatives&rdquo; and building a food-processing technology designed around that principle from the beginning.
            </p>
            <Callout>Nature created the mango. Science helps us respect it.</Callout>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {controls.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-4 rounded-2xl border border-cream bg-white p-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent/50 text-burgundy">
                  <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.6} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Control of</span>
                  <span className="block text-sm font-semibold leading-snug text-charcoal">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <StorySlide slide={slides.cleanLabel} className="mt-14" />
      </section>

      {/* USPs — the promises printed on every pack */}
      <section id="promise" aria-labelledby="promise-heading" className="scroll-mt-28 bg-mango px-6 py-20 text-charcoal md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-burgundy">Why Bangkok Mango</span>
            <TwoToneTitle id="promise-heading" text="Real Mango, Real Thai Taste" accentWords={3} onGold />
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {usps.map(({ Icon, th, en, text }) => (
              <li key={en} className="flex flex-col items-center rounded-3xl bg-ivory p-7 text-center shadow-lg shadow-burgundy/10">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-burgundy/40 text-burgundy">
                  <Icon className="h-8 w-8" />
                </span>
                <span className="text-sm font-semibold text-charcoal">{th}</span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-burgundy">{en}</span>
                <span className="mt-3 text-xs leading-relaxed text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Our founder ── */}
      <section id="founder" aria-labelledby="founder-heading" className="scroll-mt-28 bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
          {/* Portrait: the founder photo is a 1055×1491 poster (Admin → Site Content) */}
          <div className="lg:sticky lg:top-28">
            <div className="relative mx-auto aspect-5/7 max-w-md overflow-hidden rounded-[28px] border border-accent/10 bg-cream shadow-2xl shadow-burgundy/15">
              <Image
                fill
                sizes="(max-width: 1023px) calc(100vw - 48px), 448px"
                src={normalizeImagePath(content("founder_image"))}
                alt={`${founderName}, founder of Bangkok Mango`}
                className="object-cover object-top"
              />
            </div>
            <ul className="mx-auto mt-6 max-w-md space-y-2">
              {credentials.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-charcoal">
                  <Sparkles aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className={eyebrow}>Our founder</span>
            <TwoToneTitle id="founder-heading" text={founderName} accentWords={1} />
            <p className="mt-3 font-serif text-lg italic text-muted">Where Traditional Thai Medicine Meets Modern Biological Science</p>

            <p className={`mt-6 ${body}`}>
              Behind Bangkok Mango is a philosophy that food should be more than something we eat. It should nourish. It should work in harmony with nature. And it should support the biological balance of the human body.
            </p>
            <p className={`mt-4 ${body}`}>
              This philosophy comes from {founderName}, a Thai Traditional Medicine practitioner, researcher, innovator and product developer with more than 30 years of experience working with medicinal plants, herbal formulations, natural foods and plant-based health products.
            </p>
            <p className={`mt-4 ${body}`}>
              Throughout his career, he has been deeply involved in the development of herbal medicines, functional foods, botanical extracts, and advanced methods for transforming plants into products designed for human health.
            </p>
            <div className="mt-8 rounded-3xl border border-cream p-7 md:p-8">
              <p className={body}>His work bridges two worlds that are often considered separate:</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="rounded-2xl bg-cream/60 p-4 font-serif text-lg text-burgundy">The wisdom of traditional medicine</p>
                <p className="rounded-2xl bg-gold/40 p-4 font-serif text-lg text-burgundy">The precision of modern biological science</p>
              </div>
              <p className={`mt-4 ${body}`}>
                For him, these two worlds have never truly been separate. They are different ways of understanding the same thing:
              </p>
              <p className="mt-2 font-serif text-xl text-accent md:text-2xl">How nature interacts with the human body.</p>
            </div>

            <figure className="mt-10 rounded-3xl bg-ivory p-8 md:p-10">
              <Quote aria-hidden="true" className="h-8 w-8 text-mango" />
              <blockquote className="mt-3 font-serif text-xl italic leading-relaxed text-burgundy md:text-2xl">
                {content("founder_quote")}
              </blockquote>
              <figcaption className="mt-5 text-xs font-bold uppercase tracking-widest text-charcoal">
                — {founderName}, Founder, Bangkok Mango
              </figcaption>
            </figure>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="rounded-2xl border border-cream p-6">
                  <h4 className="font-serif text-lg text-burgundy">{content(`founder_point${n}_title`)}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">{content(`founder_point${n}_text`)}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* The founder's story, chapter by chapter as in the brand document */}
      <FounderStory founderName={founderName} />

      <CtaBanner
        eyebrow="Born in Thailand. Perfected by Nature & Science."
        title="From our orchard to the world."
        description="Taste the result of Kui Buri fruit, a clean-label process and very slow fermentation — real Thai mango, transformed first, then dried."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="Read Our Story"
        secondaryHref="/our-story"
      />
    </main>
  );
}
