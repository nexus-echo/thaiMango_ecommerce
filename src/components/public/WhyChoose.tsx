import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FlaskConical, Leaf, Package, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import TwoToneTitle from "./TwoToneTitle";

/* Copy follows "The Bangkok Mango Difference" in the brand document
   (Mangobangkok.docx). It never claims sun-drying — the document describes a
   slow fermentation followed by CONTROLLED drying — and makes no health claims. */
const REASONS = [
    {
        image: "/images/why-choose/orchard.svg",
        alt: "Mango tree",
        title: "Grown in Kui Buri",
        text: "Kaew Kamin mangoes from our own growing region in Prachuap Khiri Khan, traceable from orchard to pack.",
    },
    {
        image: "/images/why-choose/sun-drying.svg",
        alt: "Mango slices drying on a tray",
        title: "We Transform First",
        text: "A very slow fermentation develops flavor before controlled drying protects color, aroma and chew.",
    },
    {
        image: "/images/why-choose/quality.svg",
        alt: "Checklist and magnifying glass over a mango",
        title: "Clean-Label by Design",
        text: "No added synthetic preservatives, with microbiological and contaminant testing on finished products.",
    },
    {
        image: "/images/why-choose/thailand-to-you.svg",
        alt: "Tuk-tuk carrying mangoes",
        title: "From Thailand to the World",
        text: "Sealed in protective packaging against oxygen and moisture, then sent from our orchard to your door.",
    },
];

/* "More than 'no preservatives'" — the document's list of what the process
   controls so that unnecessary additives are not required. */
const CONTROLS = [
    "Raw materials",
    "Microorganisms",
    "Fermentation",
    "Acidity",
    "Water activity & moisture",
    "Temperature",
    "Hygiene",
    "Packaging",
];

/* "From fresh mango to finished product" — slide 4 of the brand's Our Story
   deck (public/images/our-story/04-fresh-to-finished.jpg), rebuilt as real,
   responsive text. The step photos in public/images/why-choose/process/ are
   high-res regenerations of the slide's imagery, not crops of the slide. */
const INFOGRAPHIC = "/images/our-story/04-fresh-to-finished.jpg";

const STEPS = [
    { image: "/images/why-choose/process/1-select-hq.webp", label: "Select Kaew Kamin mangoes", alt: "Two ripe Kaew Kamin mangoes with leaves" },
    { image: "/images/why-choose/process/2-prepare-hq.webp", label: "Clean, trim and prepare", alt: "A mango being washed in splashing water" },
    { image: "/images/why-choose/process/3-ferment-hq.webp", label: "Controlled fermentation / postbiotic conditioning", alt: "Mango pieces in a glass fermentation vessel" },
    { image: "/images/why-choose/process/4-season-hq.webp", label: "Thoughtful seasoning", alt: "Bowls of chili, lime and plum seasoning" },
    { image: "/images/why-choose/process/5-dry-hq.webp", label: "Controlled drying", alt: "Mango slices on trays inside a drying cabinet" },
    { image: "/images/why-choose/process/6-test-hq.webp", label: "Quality & safety testing", alt: "A dried mango slice held beside a laboratory microscope" },
    { image: "/images/why-choose/process/7-pack-hq.webp", label: "Vacuum protection and final packaging", alt: "Sealed Bangkok Mango pouches" },
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
        <section id="why-choose" className="relative overflow-hidden py-20 md:py-24 bg-white">
            {/* Hand-drawn process doodles (select → ferment → dry → test → pack),
                tiled faintly behind everything; cards keep their own solid fills. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.2]"
                style={{
                    backgroundImage: "url(/images/why-choose/process-doodles.svg)",
                    backgroundSize: "480px 480px",
                    backgroundRepeat: "repeat",
                    /* Strong at the edges, faint behind the centred copy */
                    maskImage:
                        "linear-gradient(90deg, #000 0%, rgb(0 0 0 / 0.3) 32%, rgb(0 0 0 / 0.3) 68%, #000 100%)",
                }}
            />
            <div className="relative max-w-6xl mx-auto px-6 md:px-12">
                <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16 reveal">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.3em] text-accent mb-4">
                        The Bangkok Mango difference
                    </span>
                    <TwoToneTitle text="Why Choose Bangkok Mango?" />
                    <p className="mt-5 font-serif italic text-lg md:text-xl text-accent">Not simply dried mango.</p>
                    <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-muted leading-relaxed text-pretty">
                        First comes the orchard. Then selection. Then biological transformation. Then flavor
                        development. Then controlled drying. Then protection.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {REASONS.map((reason, i) => (
                        <div
                            key={reason.title}
                            className="group relative overflow-hidden rounded-3xl border border-cream bg-white p-6 md:p-7 flex items-start gap-5 sm:flex-col sm:items-center sm:text-center transition duration-500 hover:-translate-y-1 hover:border-mango/50 hover:shadow-xl hover:shadow-burgundy/5 reveal"
                            style={i > 0 ? { transitionDelay: `${i * 120}ms` } : undefined}
                        >
                            <span className="absolute top-5 right-6 font-serif text-sm font-semibold tracking-widest text-accent/60">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-ivory ring-1 ring-cream flex items-center justify-center transition duration-500 group-hover:bg-gold/40">
                                <Image
                                    src={reason.image}
                                    alt={reason.alt}
                                    width={96}
                                    height={96}
                                    className="w-12 h-12 sm:w-18 sm:h-18 transition-transform duration-500 group-hover:scale-105"
                                />
                            </span>
                            <div className="pr-8 sm:pr-0 sm:mt-6">
                                <h3 className="font-serif text-lg md:text-xl font-semibold text-burgundy mb-2 text-balance">
                                    {reason.title}
                                </h3>
                                <p className="text-[13px] md:text-sm text-muted leading-relaxed text-pretty">
                                    {reason.text}
                                </p>
                            </div>
                            {/* Gold underline that grows on hover — the pack's foot band */}
                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-mango transition-all duration-500 group-hover:w-1/2"
                            />
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
                            <TwoToneTitle as="h3" id="process-heading" text="From Fresh Mango to Finished Product" accentWords={3} />
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
                                            quality={90}
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

                    {/* Clean-label safety system — full width, no photo */}
                    <div className="mt-16 md:mt-20 grid overflow-hidden rounded-3xl border border-cream shadow-xl shadow-burgundy/5 lg:grid-cols-[5fr_7fr] reveal">
                        {/* The pack's gold band: black text on gold, never white (2.4:1) */}
                        <div className="relative bg-mango text-charcoal p-8 md:p-10 lg:p-12">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal/70">
                                Our promise
                            </span>
                            <h3 className="mt-2 font-serif text-3xl md:text-4xl leading-tight">Clean-Label Safety System</h3>
                            <p className="mt-2 font-serif italic text-lg text-burgundy">More than &ldquo;no preservatives&rdquo;.</p>
                            <p className="mt-5 text-sm md:text-[15px] leading-relaxed text-charcoal/85 text-pretty">
                                Clean-label food should mean more than removing something from an ingredient list. It
                                means designing the entire process intelligently enough that unnecessary additives are not
                                required.
                            </p>

                            <span className="mt-8 block text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal/70">
                                Controlled at every step
                            </span>
                            <ul className="mt-3 flex flex-wrap gap-2">
                                {CONTROLS.map((control) => (
                                    <li
                                        key={control}
                                        className="rounded-full border border-charcoal/25 bg-white/25 px-3.5 py-1.5 text-[11px] font-semibold text-charcoal"
                                    >
                                        {control}
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-burgundy">
                                <ShieldCheck aria-hidden="true" className="w-4 h-4" strokeWidth={2} />
                                Food safety remains non-negotiable
                            </p>
                        </div>

                        <ul className="grid gap-3 bg-ivory p-6 sm:grid-cols-2 md:p-8 lg:p-10">
                            {SAFETY.map(({ Icon, text }, i) => (
                                <li
                                    key={text}
                                    className="group flex items-center gap-4 rounded-2xl border border-cream bg-white p-5 transition duration-300 hover:border-mango/50 hover:shadow-md"
                                >
                                    <span className="w-11 h-11 shrink-0 rounded-full bg-cream flex items-center justify-center transition duration-300 group-hover:bg-mango">
                                        <Icon aria-hidden="true" className="w-5 h-5 text-accent transition group-hover:text-charcoal" strokeWidth={1.75} />
                                    </span>
                                    <div>
                                        <span className="block text-[10px] font-bold tracking-widest text-accent/70">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="mt-0.5 block text-sm font-medium text-charcoal leading-snug text-pretty">
                                            {text}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Closing brand line (the document's homepage line) + onward link */}
                    <div className="mt-14 md:mt-16 flex flex-col items-center gap-6 text-center reveal">
                        <div className="flex w-full items-center gap-4">
                            <span aria-hidden="true" className="h-px flex-1 bg-mango/40" />
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-accent">
                                Pure fruit · Thai heritage · A healthier tomorrow
                            </p>
                            <span aria-hidden="true" className="h-px flex-1 bg-mango/40" />
                        </div>
                        <p className="font-serif text-2xl md:text-3xl text-burgundy leading-snug text-balance">
                            Born in Thailand. <span className="italic text-accent">Perfected by Nature &amp; Science.</span>
                        </p>
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
