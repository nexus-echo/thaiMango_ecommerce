"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

interface Collection {
  numeral: string;
  title: string;
  flavors: string;
  image: string;
  alt: string;
}

/* Slides 7–9 of the brand's Our Story deck (1600×900, static in /public). */
const COLLECTIONS: Collection[] = [
  {
    numeral: "I",
    title: "Fruit-forward signature flavors",
    flavors: "Plum · Passion Fruit · Roselle",
    image: "/images/our-story/07-flavors-1.jpg",
    alt: "Flavor Collection I, fruit-forward signature flavors: Plum (sweet-tart and aromatic), Passion Fruit (bright, tropical and lively) and Roselle (floral, tangy and distinctive) dried mango pouches.",
  },
  {
    numeral: "II",
    title: "Sweet, spicy and wellness-inspired flavors",
    flavors: "Lychee · Chili Salt · Ginger · Turmeric",
    image: "/images/our-story/08-flavors-2.jpg",
    alt: "Flavor Collection II, sweet, spicy and wellness-inspired flavors: Lychee (fragrant and softly sweet), Chili Salt (a bold sweet-salty-spicy bite), Ginger (warm and aromatic) and Turmeric (earthy and golden) dried mango pouches.",
  },
  {
    numeral: "III",
    title: "Special selections and serving inspiration",
    flavors: "Beetroot · Chili Lime · Original",
    image: "/images/our-story/09-flavors-3.jpg",
    alt: "Flavor Collection III, special selections: Beetroot (vibrant color with a savory-sweet twist), Chili Lime (zesty, spicy and refreshing) and Original (pure, naturally sweet and delicious). Three or four strips a serving.",
  },
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/* Home-page scroll story: the section pins full-screen below the header and
   each stretch of scrolling swaps to the next collection slide; after the
   last one the page carries on. The section is COLLECTIONS.length viewports
   tall — that height is the scroll distance the slides are spread over.
   Needs no ancestor with overflow hidden/auto (they break position: sticky);
   the home wrapper uses overflow-x-clip for that reason. */
export default function FlavorCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );

  /* Pin below the fixed header, whatever its current height. */
  useEffect(() => {
    const header = document.getElementById("main-header");
    if (!header) return;
    const observer = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    /* border-box: scrolling only changes the header's padding (py-6 → py-4),
       which the default content-box observation never reports. */
    observer.observe(header, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const pin = pinRef.current;
      if (!section || !pin) return;
      const travel = section.offsetHeight - pin.offsetHeight;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, (headerHeight - section.getBoundingClientRect().top) / travel));
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      const index = Math.min(COLLECTIONS.length - 1, Math.floor(progress * COLLECTIONS.length));
      setActive((current) => (current === index ? current : index));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reducedMotion, headerHeight]);

  /* Dots scroll to the middle of that slide's stretch of the section. */
  const goTo = (index: number) => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;
    const travel = section.offsetHeight - pin.offsetHeight;
    const start = window.scrollY + section.getBoundingClientRect().top - headerHeight;
    window.scrollTo({ top: start + ((index + 0.5) / COLLECTIONS.length) * travel, behavior: "smooth" });
  };

  if (reducedMotion) {
    return (
      <section aria-label="Flavor collections" className="bg-cream px-6 py-12 md:px-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {COLLECTIONS.map((c) => (
            <Image
              key={c.numeral}
              src={c.image}
              alt={c.alt}
              width={1600}
              height={900}
              sizes="(max-width: 1199px) calc(100vw - 48px), 1152px"
              className="h-auto w-full rounded-2xl shadow-lg"
            />
          ))}
        </div>
      </section>
    );
  }

  const current = COLLECTIONS[active];

  return (
    <section
      ref={sectionRef}
      aria-label="Flavor collections"
      /* --pin-bottom reserves the mobile bottom app nav (PublicShell pb-[68px]). */
      className="relative bg-cream [--pin-bottom:68px] lg:[--pin-bottom:0px]"
      style={{ "--pin-top": `${headerHeight}px`, height: `${COLLECTIONS.length * 100}svh` } as CSSProperties}
    >
      <div
        ref={pinRef}
        className="sticky flex flex-col overflow-hidden"
        style={{ top: "var(--pin-top)", height: "calc(100svh - var(--pin-top) - var(--pin-bottom))" }}
      >
        {/* Blurred copy of the active slide fills the letterbox around it */}
        {COLLECTIONS.map((c, i) => (
          <Image
            key={c.numeral}
            src={c.image}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className={`scale-110 object-cover blur-2xl transition-opacity duration-700 ${
              i === active ? "opacity-50" : "opacity-0"
            }`}
          />
        ))}

        {/* Scroll progress through the three collections */}
        <span className="relative z-10 block h-0.5 w-full bg-charcoal/10">
          <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </span>

        {/* Announces the collection change for screen readers at every size */}
        <p className="sr-only" aria-live="polite">
          Flavor Collection {current.numeral}: {current.title}. {current.flavors}.
        </p>

        {/* Phones: slide + caption are centred as one group (a 16:9 slide
            can't fill a tall screen). md+: the slide takes the free height
            inside a padded, rounded frame and the caption row sits below. */}
        <div className="relative z-10 flex flex-1 flex-col justify-center md:justify-between">
          {/* Slide frame: the largest 16:9 box that fits, so no slide text is cropped */}
          <div className="flex items-center justify-center px-4 pt-4 md:flex-1 md:px-8 md:pt-6">
            <div
              className="relative aspect-video overflow-hidden rounded-2xl bg-cream shadow-2xl shadow-burgundy/20"
              style={{ width: "min(100%, calc((100svh - var(--pin-top) - var(--pin-bottom) - 7rem) * 16 / 9))" }}
            >
              {/* Slider track: slides sit side by side and the track moves one
                  frame-width per collection. */}
              <div
                className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{ transform: `translateX(-${active * 100}%)` }}
              >
                {COLLECTIONS.map((c, i) => (
                  <div key={c.numeral} className="relative h-full w-full shrink-0" aria-hidden={i !== active}>
                    <Image
                      src={c.image}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Caption + slide dots */}
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-6 text-center md:flex-row md:justify-between md:gap-4 md:px-8 md:py-4 md:text-left">
            <div className="min-w-0">
              <p className="text-xs text-charcoal">
                <span className="font-bold uppercase tracking-[0.2em] text-beetroot">Collection {current.numeral}</span>
                <span className="hidden md:inline"> · {current.flavors}</span>
              </p>
              <p className="mt-2 text-xl font-medium leading-snug tracking-tight md:hidden">{current.title}</p>
              <p className="mt-1 text-sm text-muted md:hidden">{current.flavors}</p>
            </div>
            <div className="flex items-center gap-2">
              {COLLECTIONS.map((c, i) => (
                <button
                  key={c.numeral}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show Flavor Collection ${c.numeral}`}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-accent" : "w-2 bg-charcoal/25 hover:bg-charcoal/50"
                  }`}
                />
              ))}
            </div>
            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal transition hover:text-accent"
            >
              Shop flavors <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
