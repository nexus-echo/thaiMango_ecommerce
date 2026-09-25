import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FlaskConical, Leaf, Package, ShieldCheck, Sparkles, Sprout } from "lucide-react";

/* Every line here restates something the site already claims elsewhere
   (trust pillars, footer, expert panel) — no new figures. Swap in real
   numbers ("20+ checks", "N grower families") only once they're verified. */
const REASONS = [
    {
        image: "/images/why-choose/orchard.svg",
        alt: "Mango tree",
        title: "Orchard-Direct Sourcing",
        text: "Ripe mangoes hand-selected from Thai orchards at the peak of their sweetness.",
    },
    {
        image: "/images/why-choose/sun-drying.svg",
        alt: "Mango slices sun-drying on a tray",
        /* Non-breaking hyphen keeps "Sun-Drying" on one line. */
        title: "Traditional Sun‑Drying",
        text: "Dried slowly, the way it's been done for generations, for that soft, chewy bite.",
    },
    {
        image: "/images/why-choose/quality.svg",
        alt: "Checklist and magnifying glass over a mango",
        title: "Careful Quality Checks",
        text: "Checked for ripeness, texture and taste, with zero artificial preservatives.",
    },
    {
        image: "/images/why-choose/thailand-to-you.svg",
        alt: "Tuk-tuk carrying mangoes",
        title: "From Thailand, to You",
        text: "Authentically produced and packed in Thailand, then sent straight to your door.",
    },
];

/* "From fresh mango to finished product" — slide 4 of the brand's Our Story
   deck (public/images/our-story/04-fresh-to-finished.jpg). Its step photos and
   pouch shot were cropped out of the slide into public/images/why-choose/ so
   the copy can be real, responsive text instead of words baked into a picture. */
const INFOGRAPHIC = "/images/our-story/04-fresh-to-finished.jpg";

const STEPS = [
    { image: "/images/why-choose/process/1-select.webp", label: "Select Kaew Kamin mangoes", alt: "Two ripe Kaew Kamin mangoes with leaves" },
    { image: "/images/why-choose/process/2-prepare.webp", label: "Clean, trim and prepare", alt: "A mango being washed in splashing water" },
    { image: "/images/why-choose/process/3-ferment.webp", label: "Controlled fermentation / postbiotic conditioning", alt: "Mango pieces in a glass fermentation vessel" },
    { image: "/images/why-choose/process/4-season.webp", label: "Thoughtful seasoning", alt: "Bowls of chili, lime and plum seasoning" },
    { image: "/images/why-choose/process/5-dry.webp", label: "Controlled drying", alt: "Mango slices on trays inside a drying cabinet" },
    { image: "/images/why-choose/process/6-test.webp", label: "Quality & safety testing", alt: "A dried mango slice held beside a laboratory microscope" },
    { image: "/images/why-choose/process/7-pack.webp", label: "Vacuum protection and final packaging", alt: "Sealed Bangkok Mango pouches" },
];

const SAFETY = [
    { Icon: Leaf, text: "No added synthetic preservatives" },
    { Icon: FlaskConical, text: "No artificial antifungal agents" },
    { Icon: Sprout, text: "No unnecessary artificial antioxidants" },
    { Icon: ShieldCheck, text: "Microbiological and heavy metal testing" },
    { Icon: Sparkles, text: "Designed for stable color, aroma and flavor" },
    { Icon: Package, text: "Shelf-stable for over 1 year when properly stored" },
];

export default function WhyChoose() {
    return (
        <section id="why-choose" className="py-20 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6 md:px-12">
                <h2 className="font-serif text-3xl md:text-4xl text-burgundy text-center mb-14 md:mb-16 reveal">
                    Why Choose Bangkok Mango?
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10">
                    {REASONS.map((reason, i) => (
                        <div
                            key={reason.title}
                            className="flex flex-col items-center text-center group reveal"
                            style={i > 0 ? { transitionDelay: `${i * 120}ms` } : undefined}
                        >
                            <Image
                                src={reason.image}
                                alt={reason.alt}
                                width={96}
                                height={96}
                                className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 transition-transform duration-500 group-hover:-translate-y-1"
                            />
                            <h3 className="font-serif text-lg md:text-xl font-semibold text-burgundy mb-2 text-balance">
                                {reason.title}
                            </h3>
                            <p className="text-[13px] md:text-sm text-muted leading-relaxed max-w-60 text-pretty">
                                {reason.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* From fresh mango to finished product */}
                <div className="mt-20 md:mt-28 border-t border-cream pt-16 md:pt-20">
                    <div className="grid gap-6 md:grid-cols-2 md:items-end mb-12 md:mb-16 reveal">
                        <div>
                            <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-3">
                                Orchard to pack
                            </span>
                            <h3 id="process-heading" className="font-serif text-3xl md:text-4xl text-burgundy leading-tight">
                                From Fresh Mango
                                <br />
                                <span className="text-accent">to Finished Product</span>
                            </h3>
                        </div>
                        <div className="md:justify-self-end md:max-w-md">
                            <p className="text-sm md:text-base text-muted leading-relaxed">
                                A clean, controlled process from orchard to pack — seven steps, each designed to protect the
                                fruit&apos;s natural color, aroma and flavor.
                            </p>
                            <a
                                href={INFOGRAPHIC}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-burgundy underline decoration-accent/40 underline-offset-8 transition hover:decoration-accent"
                            >
                                View the full infographic <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Seven-step timeline: a list on phones, a connected row from lg */}
                    <div className="relative">
                        <span
                            aria-hidden="true"
                            className="hidden lg:block absolute top-11 left-[7%] right-[7%] border-t-2 border-dashed border-mango/50"
                        />
                        <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-7">
                            {STEPS.map((step, i) => (
                                <li
                                    key={step.label}
                                    className="flex items-center gap-4 sm:flex-col sm:gap-0 sm:text-center reveal"
                                    style={i > 0 ? { transitionDelay: `${i * 80}ms` } : undefined}
                                >
                                    <div className="relative shrink-0">
                                        <Image
                                            src={step.image}
                                            alt={step.alt}
                                            width={104}
                                            height={104}
                                            className="w-18 h-18 sm:w-22 sm:h-22 rounded-full object-cover ring-2 ring-mango ring-offset-4 ring-offset-white shadow-md"
                                        />
                                        <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-burgundy text-gold text-xs font-bold flex items-center justify-center ring-4 ring-white">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <p className="text-sm sm:text-[13px] font-semibold text-charcoal leading-snug sm:mt-5 sm:max-w-36 text-pretty">
                                        {step.label}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Product visual + clean-label safety system */}
                    <div className="mt-16 md:mt-20 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
                        <figure className="relative overflow-hidden rounded-3xl bg-cream aspect-9/8 lg:aspect-auto lg:min-h-full reveal">
                            <Image
                                src="/images/why-choose/clean-label-pouches-centered.webp"
                                alt="Bangkok Mango Chili Lime and Plum dried mango pouches on woven cloth among mango leaves"
                                fill
                                sizes="(max-width: 1023px) calc(100vw - 48px), 560px"
                                className="object-cover"
                            />
                            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />
                            <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
                                <p className="font-serif italic text-xl sm:text-2xl md:text-3xl leading-tight">Real mango. Real goodness.</p>
                                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                                    Kaew Kamin mango · Kui Buri, Thailand
                                </p>
                            </figcaption>
                        </figure>

                        <div className="overflow-hidden rounded-3xl border border-cream bg-ivory flex flex-col reveal">
                            {/* The pack's gold band: black text on gold, never white (2.4:1) */}
                            <div className="bg-mango px-7 py-6 md:px-9">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal/70">
                                    Our promise
                                </span>
                                <h4 className="mt-1 font-serif text-2xl md:text-[1.75rem] text-charcoal leading-tight">
                                    Clean-Label Safety System
                                </h4>
                            </div>
                            <ul className="flex-1 divide-y divide-cream px-7 md:px-9">
                                {SAFETY.map(({ Icon, text }) => (
                                    <li key={text} className="flex items-center gap-4 py-4">
                                        <span className="w-10 h-10 shrink-0 rounded-full bg-cream flex items-center justify-center">
                                            <Icon aria-hidden="true" className="w-5 h-5 text-accent" strokeWidth={1.75} />
                                        </span>
                                        <span className="text-sm text-charcoal leading-snug">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Closing line from the slide + onward link */}
                    <div className="mt-14 md:mt-16 flex flex-col items-center gap-6 reveal">
                        <div className="flex w-full items-center gap-4">
                            <span aria-hidden="true" className="h-px flex-1 bg-mango/40" />
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-accent text-center">
                                Pure fruit · Thai heritage · A healthier tomorrow
                            </p>
                            <span aria-hidden="true" className="h-px flex-1 bg-mango/40" />
                        </div>
                        <Link
                            href="/our-story"
                            className="inline-flex items-center gap-3 rounded-full border border-burgundy px-8 py-3.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-burgundy transition hover:bg-burgundy hover:text-white"
                        >
                            Discover our story <ArrowRight aria-hidden="true" className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
