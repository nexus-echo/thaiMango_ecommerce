import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import TwoToneTitle from "./TwoToneTitle";

/* "Where tradition meets biotechnology" — slide 5 of the brand's Our Story
   deck (public/images/our-story/05-fermentation.jpg), rebuilt with real text.
   Photos in public/images/fermentation/ are high-res regenerations of the
   slide's imagery (the slide itself is too small to crop from); steps 3 and 5
   are line art, so they are vector redraws. Wording
   stays within the brand document: no health claims beyond "inspired by". */
const STEPS = [
    {
        image: "/images/fermentation/step-1-banana-hq.webp",
        alt: "Ripe Thai Namwa bananas and banana slices",
        title: "Thai Namwa banana substrate",
        text: "Our cultures begin on Thai Namwa banana.",
    },
    {
        image: "/images/fermentation/step-2-cultures-hq.webp",
        alt: "Illustration of beneficial microorganisms",
        title: "Beneficial cultures",
        text: "Selected microorganisms start the transformation.",
    },
    {
        image: "/images/fermentation/step-3-fermenter.svg",
        alt: "Line drawing of a fermentation tank",
        title: "Very slow fermentation",
        text: "Microbial and enzymatic change, never rushed.",
    },
    {
        image: "/images/fermentation/step-4-mango-hq.webp",
        alt: "Golden strips of transformed dried mango",
        title: "Transformed mango matrix",
        text: "Organic acids and metabolites reshape the fruit.",
    },
    {
        image: "/images/fermentation/step-5-flavor.svg",
        alt: "Line drawing of a droplet and leaf",
        title: "Richer flavor & thoughtful processing",
        text: "Deeper flavor, then careful drying.",
    },
];

const PILLARS = ["Natural fruits", "Living cultures", "A better tomorrow"];

export default function FermentationProcess() {
    return (
        <section id="fermentation" aria-labelledby="fermentation-heading" className="relative overflow-hidden border-y border-cream bg-ivory text-charcoal py-20 md:py-28">
            {/* Soft golden light, echoing the fermentation slide */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(55% 65% at 85% 10%, rgba(255,228,144,0.55), transparent 65%), radial-gradient(45% 55% at 0% 100%, rgba(236,164,12,0.12), transparent 65%)",
                }}
            />
            {/* Hand-drawn fermentation doodles (banana → cultures → tank →
                transformed mango), tiled faintly; companion to Why Choose's. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.25]"
                style={{
                    backgroundImage: "url(/images/fermentation/fermentation-doodles.svg)",
                    backgroundSize: "480px 480px",
                    backgroundRepeat: "repeat",
                    /* Strong at the edges, faint behind the centred copy */
                    maskImage:
                        "linear-gradient(90deg, #000 0%, rgb(0 0 0 / 0.3) 32%, rgb(0 0 0 / 0.3) 68%, #000 100%)",
                }}
            />

            <div className="relative max-w-screen-2xl mx-auto px-6 md:px-12">
                {/* Intro + visual */}
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
                    <div className="reveal">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.3em] text-accent mb-5">
                            Where tradition meets biotechnology
                        </span>
                        <TwoToneTitle id="fermentation-heading" text="Our Very Slow Fermentation Process" isbreak />
                        <p className="mt-7 max-w-xl text-sm md:text-base leading-7 md:leading-8 text-muted">
                            Fermentation is one of humanity&apos;s oldest food technologies. We bring it into modern food
                            biotechnology: selected beneficial cultures, grown on Thai Namwa banana, slowly transform the
                            mango before it is ever dried.
                        </p>
                        <ul className="mt-8 flex flex-wrap gap-2.5">
                            {PILLARS.map((pillar) => (
                                <li
                                    key={pillar}
                                    className="rounded-full border border-mango/40 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy"
                                >
                                    {pillar}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Fermenter photo with the Ginger pouch overlapping its corner */}
                    <div className="relative mx-auto w-full max-w-lg pb-10 lg:pb-0 reveal">
                        <div className="relative aspect-407/415 overflow-hidden rounded-3xl shadow-2xl shadow-burgundy/15 ring-1 ring-cream">
                            <Image
                                src="/images/fermentation/fermenter-hq.webp"
                                alt="Stainless-steel Bangkok Mango fermentation tank with a sight glass of bubbling culture beside a laboratory flask"
                                fill
                                sizes="(max-width: 1023px) calc(100vw - 48px), 512px"
                                className="object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-2 left-4 w-2/5 overflow-hidden rounded-2xl shadow-2xl shadow-burgundy/25 ring-4 ring-ivory sm:-left-6 lg:-bottom-10 lg:-left-12">
                            <Image
                                src="/images/fermentation/ginger-pouch-hq.webp"
                                alt="Bangkok Mango Ginger flavor dried mango pouch with fresh ginger"
                                width={900}
                                height={900}
                                sizes="(max-width: 1023px) 40vw, 205px"
                                className="h-auto w-full"
                            />
                        </div>
                        <p className="absolute -top-5 right-2 rotate-3 rounded-full bg-mango px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal shadow-lg sm:right-6">
                            Flavor deepens with time
                        </p>
                    </div>
                </div>

                {/* Five-step flow: a list on phones, a connected row from lg */}
                <ol className="mt-20 md:mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-y-12 lg:grid-cols-5 lg:gap-6">
                    {STEPS.map((step, i) => (
                        <li
                            key={step.title}
                            className="relative flex items-center gap-5 sm:flex-col sm:gap-0 sm:text-center reveal"
                            style={i > 0 ? { transitionDelay: `${i * 90}ms` } : undefined}
                        >
                            {i < STEPS.length - 1 && (
                                <ArrowRight
                                    aria-hidden="true"
                                    className="hidden lg:block absolute top-9 -right-6 w-5 h-5 text-accent/60"
                                />
                            )}
                            <div className="relative shrink-0">
                                <Image
                                    src={step.image}
                                    alt={step.alt}
                                    width={100}
                                    height={100}
                                    quality={90}
                                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-mango ring-offset-4 ring-offset-ivory shadow-md"
                                />
                                <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-burgundy text-gold text-xs font-bold flex items-center justify-center ring-4 ring-ivory">
                                    {i + 1}
                                </span>
                            </div>
                            <div className="sm:mt-6">
                                <h3 className="font-serif text-base md:text-lg leading-snug text-burgundy">{step.title}</h3>
                                <p className="mt-1 text-[13px] leading-relaxed text-muted sm:mx-auto sm:max-w-52">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                {/* Science panel */}
                <div className="mt-20 md:mt-24 grid overflow-hidden rounded-3xl border border-cream bg-white text-charcoal shadow-xl shadow-burgundy/5 md:grid-cols-[minmax(0,2fr)_3fr] lg:grid-cols-[minmax(0,4fr)_7fr_5fr] reveal">
                    <div className="relative aspect-390/170 md:aspect-auto md:min-h-full">
                        <Image
                            src="/images/fermentation/microbiome-hq.webp"
                            alt="Golden microscopic view of cultures and cells"
                            fill
                            sizes="(max-width: 767px) 100vw, 40vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="p-8 md:p-10">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-accent mb-3">The science</span>
                        <h3 className="font-serif text-2xl md:text-3xl leading-tight text-burgundy">
                            Inspired by Microbiome &amp; Postbiotic Science
                        </h3>
                        <p className="mt-4 text-sm md:text-base leading-7 text-muted">
                            Our process focuses on biological transformation during fermentation. Beneficial microorganisms
                            and enzymatic activity help generate valuable organic acids and fermentation-derived metabolites
                            that contribute to flavor and food matrix transformation.
                        </p>
                        <Link
                            href="/our-story"
                            className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-burgundy underline decoration-accent/40 underline-offset-8 transition hover:decoration-accent"
                        >
                            Read the full story <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <figure className="flex flex-col justify-center border-t border-cream p-8 md:col-span-2 md:p-10 lg:col-span-1 lg:border-t-0 lg:border-l">
                        <Quote aria-hidden="true" className="w-8 h-8 text-mango" />
                        <blockquote className="mt-3 font-serif italic text-3xl md:text-4xl lg:text-[2rem] xl:text-4xl leading-tight text-burgundy">
                            <span className="block sm:whitespace-nowrap">We transform first.</span>
                            <span className="block sm:whitespace-nowrap">Then we dry.</span>
                        </blockquote>
                    </figure>
                </div>

                <p className="mt-12 text-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-accent/80">
                    Real Thai mango · Science for a tastier tomorrow
                </p>
            </div>
        </section>
    );
}
