import Image from "next/image";

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
            </div>
        </section>
    );
}
