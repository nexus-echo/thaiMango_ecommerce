import Image from "next/image";

/* One slide of the brand's ten-slide "Our Story" deck (1600×900), shown whole
   — never cropped, because the slides carry text. Clicking opens the
   full-size image so the small print stays readable. Shared by /our-story
   and /about-us. */
export interface Slide {
  number: number;
  src: string;
  alt: string;
  caption: string;
}

export default function StorySlide({
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
