import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Ban,
  Beaker,
  ClipboardList,
  Droplets,
  FlaskConical,
  HelpCircle,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sun,
  Thermometer,
} from "lucide-react";
import CtaBanner from "@/components/public/CtaBanner";
import TwoToneTitle from "@/components/public/TwoToneTitle";

/* What goes into a Bangkok Mango pouch, from the brand document
   (Mangobangkok.docx) and the packs. Deliberately claims nothing the
   document or the packs don't: the fruit is Kaew Kamin mango from Kui Buri,
   the process is slow fermentation + CONTROLLED drying (never "sun-dried"),
   and the clean-label promise is the document's three "no added" lines.
   Each pouch's exact ingredient list lives on its product page (admin-edited
   `ingredients` field), so this page links there instead of restating it. */

export const metadata: Metadata = {
  title: "Ingredients | Bangkok Mango — Kaew Kamin Mango, Clean-Label Process",
  description:
    "What's inside every Bangkok Mango pouch: Kaew Kamin mango from Kui Buri, Thailand, a slow fermentation begun on Thai Namwa banana, real Thai flavors — and no added synthetic preservatives.",
};

const eyebrow = "mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-accent";
const body = "text-sm leading-7 text-muted md:text-base md:leading-8";

const traits = [
  ["Golden flesh", "A beautiful yellow-golden color develops through the fruit."],
  ["Firm & crisp", "Harvested at the right stage, the texture is firm, crisp and dense."],
  ["Sweet-tart balance", "Brightness from natural acidity, followed by sweetness and a characteristic mango aroma."],
];

/* The eleven flavors on the packs (home "Available Flavors" rail). Thai names
   are read off each pack (Lychee's artwork wrongly prints Plum's รสบ๊วย, so it
   uses ลิ้นจี่). Taste
   notes are the brand deck's; Strawberry isn't in the deck, so its note only
   describes the flavor. */
const flavors = [
  { name: "Original", th: "รสออรีจินอล", note: "Pure, naturally sweet and delicious.", image: "/images/products/bangkok-mango-original-front.png", tint: "#F9D98A" },
  { name: "Chili Lime", th: "พริกมะนาว", note: "Zesty, spicy and refreshing.", image: "/images/products/bangkok-mango-chili-lime-front.png", tint: "#D9E8A6" },
  { name: "Chili Salt", th: "พริกเกลือ", note: "A bold sweet-salty-spicy bite.", image: "/images/products/bangkok-mango-chili-salt-front.png", tint: "#F4B79A" },
  { name: "Plum", th: "รสบ๊วย", note: "Sweet-tart and aromatic.", image: "/images/products/bangkok-mango-plum-front.png", tint: "#CDB1D6" },
  { name: "Passion Fruit", th: "เสาวรส", note: "Bright, tropical and lively.", image: "/images/products/bangkok-mango-passion-front.png", tint: "#E8C57E" },
  { name: "Roselle", th: "กระเจี๊ยบแดง", note: "Floral, tangy and distinctive.", image: "/images/products/bangkok-mango-Roselle-front.png", tint: "#E3A0AE" },
  { name: "Lychee", th: "ลิ้นจี่", note: "Fragrant and softly sweet.", image: "/images/products/bangkok-mango-Lychee-front.png", tint: "#F6C9CF" },
  { name: "Ginger", th: "รสขิง", note: "Warm and aromatic.", image: "/images/products/bangkok-mango-Ginger-front.png", tint: "#EFCB9A" },
  { name: "Turmeric", th: "ขมิ้น", note: "Earthy and golden.", image: "/images/products/bangkok-mango-Turmeric-front.png", tint: "#F6CF6B" },
  { name: "Beetroot", th: "บีทรูท", note: "Vibrant color with a savory-sweet twist.", image: "/images/products/bangkok-mango-beetroot-front.png", tint: "#E7A6B8" },
  { name: "Strawberry", th: "สตรอเบอร์รี่", note: "Berry-bright and fruity.", image: "/images/products/bangkok-mango-strawberry-front.png", tint: "#F5AFAF" },
];

const leftOut = [
  "Added synthetic preservatives",
  "Artificial antifungal agents",
  "Unnecessary artificial antioxidants",
];

const controls = [
  { Icon: Leaf, label: "Raw-material quality" },
  { Icon: FlaskConical, label: "Fermentation" },
  { Icon: Beaker, label: "Acidity" },
  { Icon: Droplets, label: "Moisture management" },
  { Icon: Thermometer, label: "Controlled drying" },
  { Icon: ShieldCheck, label: "Hygienic processing" },
  { Icon: PackageCheck, label: "Protective packaging" },
];

/* Pack promises (the badge bar printed on every pouch) */
const promises = [
  { th: "ธรรมชาติ 100%", en: "100% Natural", path: <><path d="M12 22V10" /><path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9" /><path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7" /><line x1="8" y1="22" x2="16" y2="22" /></> },
  { th: "คัดสรรจากมะม่วงคุณภาพ", en: "Finest Quality Mango", path: <><path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8" /><path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z" /><path d="M10 4.5c1-1.5 2-2 3-2" /></> },
  { th: "ผลิตในประเทศไทย", en: "Product of Thailand", path: null },
  { th: "อร่อย เพลิน เคี้ยวหนึบ", en: "Delicious & Chewy", path: <><path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z" /><circle cx="9" cy="8" r="1" fill="currentColor" /><circle cx="15" cy="7" r="0.8" fill="currentColor" /></> },
  { th: "เหมาะสำหรับทุกวัย", en: "For All Ages", path: <><circle cx="8" cy="5.5" r="2.2" /><path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5" /><circle cx="16.5" cy="7" r="1.8" /><path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4" /></> },
];

export default function IngredientsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ivory px-6 pb-20 pt-12 md:px-12 md:pb-24 md:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "url(/images/why-choose/process-doodles.svg)",
            backgroundSize: "480px 480px",
            maskImage: "linear-gradient(90deg, rgb(0 0 0 / 0.25) 0%, rgb(0 0 0 / 0.25) 50%, #000 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-3 text-xs text-muted">
            <Link href="/" className="transition hover:text-charcoal">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-charcoal">Ingredients</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <span className={eyebrow}>Real fruit, nothing to hide</span>
              <h1 className="font-serif text-4xl font-normal leading-[1.1] md:text-6xl">
                <span className="block text-burgundy">What&apos;s Inside</span>
                <span className="block text-accent">Every Pack</span>
              </h1>
              <p className={`mt-6 max-w-xl ${body}`}>
                Every pouch begins with one fruit — Kaew Kamin mango from Kui Buri, Thailand — transformed by a very slow fermentation, carefully dried, then given its flavor. Quality cannot be added afterward. It must already exist inside the mango.
              </p>
              <ul className="mt-8 flex flex-wrap gap-3">
                {[
                  ["#mango", "The Mango"],
                  ["#flavors", "The Flavors"],
                  ["#left-out", "What We Leave Out"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="inline-flex items-center gap-2 rounded-full border border-burgundy/25 bg-white/70 px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-burgundy transition hover:bg-burgundy hover:text-white">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="relative aspect-3/2 overflow-hidden rounded-3xl shadow-2xl shadow-burgundy/15">
                <Image
                  src="/images/ingredients/dried-mango-classic.webp"
                  alt="Golden Bangkok Mango dried mango slices beside a ripe mango and a green leaf"
                  fill
                  preload
                  sizes="(max-width: 1023px) calc(100vw - 48px), 520px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-4 w-32 rotate-[-6deg] drop-shadow-2xl sm:-left-8 sm:w-40">
                <Image
                  src="/images/products/bangkok-mango-original-front.png"
                  alt="Bangkok Mango Original flavor dried mango pouch"
                  width={1086}
                  height={1448}
                  sizes="160px"
                  className="h-auto w-full"
                />
              </div>
              <p className="absolute -top-4 right-4 rotate-3 rounded-full bg-mango px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal shadow-lg">
                Kaew Kamin · Kui Buri
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The heart: Kaew Kamin mango */}
      <section id="mango" aria-labelledby="mango-heading" className="scroll-mt-28 bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-3/2 overflow-hidden rounded-3xl lg:order-2">
            <Image
              src="/images/processing/mango-slicing.webp"
              alt="Golden Kaew Kamin mango flesh being sliced into even strips"
              fill
              sizes="(max-width: 1023px) calc(100vw - 48px), 520px"
              className="object-cover"
            />
          </div>
          <div>
            <span className={eyebrow}>Ingredient no. 1 · The heart of every pack</span>
            <TwoToneTitle id="mango-heading" text="Kaew Kamin Mango" accentWords={1} isbreak />
            <p className="mt-3 font-serif text-lg italic text-muted">Grown in Kui Buri, Prachuap Khiri Khan, Thailand.</p>
            <p className={`mt-6 ${body}`}>
              A distinctive golden-fleshed Thai variety, selected for characteristics that make it particularly interesting for premium fruit processing. It is not simply sweet — its character comes from contrast.
            </p>
            <dl className="mt-8 space-y-4">
              {traits.map(([title, text]) => (
                <div key={title} className="flex gap-4 rounded-2xl bg-ivory p-5">
                  <Sun aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <dt className="font-serif text-lg text-burgundy">{title}</dt>
                    <dd className="mt-1 text-sm leading-6 text-muted">{text}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <Link href="/about-us#product" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-burgundy underline decoration-accent/40 underline-offset-8 transition hover:decoration-accent">
              Where it grows <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Behind the label: the fermentation culture */}
      <section aria-labelledby="culture-heading" className="relative overflow-hidden bg-burgundy px-6 py-20 text-white md:px-12 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {[
              ["/images/fermentation/step-1-banana-hq.webp", "Ripe Thai Namwa bananas and banana slices", "Thai Namwa banana"],
              ["/images/fermentation/step-2-cultures-hq.webp", "Illustration of beneficial microorganisms in a dish", "Beneficial cultures"],
            ].map(([src, alt, label], i) => (
              <figure key={label} className={`text-center ${i === 1 ? "mt-16" : ""}`}>
                <Image src={src} alt={alt} width={400} height={400} sizes="176px" className="h-36 w-36 rounded-full object-cover ring-4 ring-gold/70 ring-offset-4 ring-offset-burgundy sm:h-44 sm:w-44" />
                <figcaption className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{label}</figcaption>
              </figure>
            ))}
          </div>
          <div>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Behind the ingredient list</span>
            <h2 id="culture-heading" className="font-serif text-3xl font-normal leading-tight md:text-4xl">
              <span className="block">We transform first.</span>
              <span className="block text-gold">Then we dry.</span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-white/80 md:text-base md:leading-8">
              Our fermentation culture begins with selected beneficial microorganisms cultivated using <strong className="font-semibold text-gold">Thai Namwa banana</strong> as part of the fermentation substrate. Rather than rushing, we let microbial and enzymatic transformation happen under carefully controlled conditions — before the mango is ever dried.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/80 md:text-base md:leading-8">
              It is a fundamentally different philosophy from simply coating fruit with flavor and drying it.
            </p>
            <Link href="/our-story" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold underline decoration-gold/40 underline-offset-8 transition hover:decoration-gold">
              The fermentation story <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The flavors */}
      <section id="flavors" aria-labelledby="flavors-heading" className="scroll-mt-28 bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
            <div>
              <span className={eyebrow}>Real Thai flavors</span>
              <TwoToneTitle id="flavors-heading" text="One Mango, Eleven Characters" accentWords={2} isbreak />
            </div>
            <p className={`max-w-md md:justify-self-end ${body}`}>
              Every flavor starts from the same Kaew Kamin mango and the same careful process — then takes on a character of its own.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {flavors.map(({ name, th, note, image, tint }) => (
              <li key={name}>
                <Link href="/shop" className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-cream transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative flex aspect-4/3 items-end justify-center pt-4" style={{ backgroundColor: tint }}>
                    <Image
                      src={image}
                      alt={`Bangkok Mango ${name} flavor dried mango pouch`}
                      width={600}
                      height={800}
                      sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 260px"
                      className="h-[92%] w-auto translate-y-3 object-contain drop-shadow-xl transition duration-500 group-hover:translate-y-1 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-lg text-burgundy">{name}</h3>
                    <p className="text-xs font-semibold text-accent">{th}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
                  </div>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop" className="flex h-full min-h-56 flex-col items-center justify-center gap-4 rounded-3xl bg-burgundy p-6 text-center text-white transition hover:bg-charcoal">
                <span className="font-serif text-2xl">Taste them all</span>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold">
                  Shop the flavors <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* What we leave out, and how */}
      <section id="left-out" aria-labelledby="left-out-heading" className="scroll-mt-28 bg-white px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className={eyebrow}>Our clean-label promise</span>
            <TwoToneTitle id="left-out-heading" text="What We Leave Out" accentWords={2} isbreak />
            <p className={`mt-5 ${body}`}>Our formulation is designed without:</p>
          </div>
          <ul className="grid gap-5 md:grid-cols-3">
            {leftOut.map((item) => (
              <li key={item} className="flex flex-col items-center rounded-3xl border border-cream bg-ivory px-6 py-10 text-center">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-burgundy text-gold">
                  <Ban aria-hidden="true" className="h-8 w-8" strokeWidth={1.6} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">No</span>
                <span className="mt-1 font-serif text-xl leading-snug text-burgundy">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-16 grid items-center gap-10 rounded-3xl bg-cream/50 p-8 md:p-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h3 className="font-serif text-2xl leading-snug text-burgundy md:text-3xl">So how does it stay good without them?</h3>
              <p className={`mt-4 ${body}`}>
                By controlling the food environment itself, rather than depending primarily on conventional preservative systems. Protective packaging minimises exposure to oxygen and moisture — shelf-stable for over a year when properly stored.
              </p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {controls.map(({ Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm">
                  <Icon aria-hidden="true" className="h-4 w-4 text-accent" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-3 text-center text-sm leading-7 text-muted">
            <ShieldCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-accent" />
            <span>
              <strong className="font-semibold text-charcoal">Food safety remains non-negotiable.</strong> Finished products are subjected to quality and safety controls, including appropriate microbiological and contaminant testing.
            </span>
          </p>
        </div>
      </section>

      {/* Reading the label */}
      <section aria-labelledby="label-heading" className="bg-ivory px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <span className={eyebrow}>Read the label</span>
            <TwoToneTitle id="label-heading" text="Every Pouch, Fully Listed" accentWords={2} isbreak />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Link href="/shop" className="group flex items-start gap-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-cream transition hover:shadow-lg md:p-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream text-burgundy">
                <ClipboardList aria-hidden="true" className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-serif text-xl text-burgundy">Full ingredient list for each flavor</span>
                <span className="mt-2 block text-sm leading-6 text-muted">
                  Every product page carries that pouch&apos;s complete ingredients and allergen notes, exactly as printed on the pack.
                </span>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-accent">
                  Browse products <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
            <Link href="/faq" className="group flex items-start gap-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-cream transition hover:shadow-lg md:p-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream text-burgundy">
                <HelpCircle aria-hidden="true" className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-serif text-xl text-burgundy">Questions about allergens?</span>
                <span className="mt-2 block text-sm leading-6 text-muted">
                  Our FAQ covers ingredients, allergens and dietary questions — or ask us directly and we&apos;ll answer from the label.
                </span>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-accent">
                  Ingredients &amp; allergens FAQ <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pack promises — the badge bar printed on every pouch */}
      <section aria-label="Printed on every pack" className="border-y border-accent/40 bg-mango text-charcoal">
        <ul className="mx-auto grid max-w-screen-2xl grid-cols-2 items-center gap-x-6 gap-y-10 px-6 py-10 text-center sm:px-10 md:grid-cols-5 md:gap-y-0 md:divide-x md:divide-charcoal/20 md:py-8">
          {promises.map(({ th, en, path }, i) => (
            <li key={en} className={`flex flex-col items-center px-2 md:px-4 ${i === promises.length - 1 ? "col-span-2 md:col-span-1" : ""}`}>
              {path ? (
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-charcoal/45">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {path}
                  </svg>
                </span>
              ) : (
                <span className="mb-3 flex h-14 w-14 items-center justify-center">
                  <svg className="h-9 w-14 drop-shadow-md" viewBox="0 0 54 36" aria-hidden="true">
                    <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
                    <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
                    <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
                  </svg>
                </span>
              )}
              <span className="mb-1 text-sm font-semibold">{th}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-burgundy">{en}</span>
            </li>
          ))}
        </ul>
      </section>

      <CtaBanner
        eyebrow="Nothing to hide"
        title="Read the label, then taste it"
        description="Kaew Kamin mango, a slow fermentation and real Thai flavors — and nothing that doesn't need to be there."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="About Us"
        secondaryHref="/about-us"
      />
    </main>
  );
}
