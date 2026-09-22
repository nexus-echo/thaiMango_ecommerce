"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";

const THUMB_ACTIVE_CLASS =
  "thumb-btn relative rounded-2xl overflow-hidden aspect-square bg-white p-1 ring-2 ring-accent shadow-md transition-all duration-300 opacity-100 hover:-translate-y-0.5";
const THUMB_INACTIVE_CLASS =
  "thumb-btn relative rounded-2xl overflow-hidden aspect-square bg-white p-1 ring-1 ring-cream opacity-70 shadow-sm transition-all duration-300 hover:opacity-100 hover:ring-accent/50 hover:-translate-y-0.5";

/** How much the side pane magnifies, and so how small the lens box is. */
const ZOOM_FACTOR = 2.2;

/** Dim-swap-brighten, so a thumbnail click reads as a change, not a jump. */
const FADE_MS = 100;

interface ProductGalleryProps {
  images: string[];
  alt: string;
  /** First highlight, shown as the corner badge. */
  badge?: string;
  index: number;
  onIndexChange: (index: number) => void;
  /** Opens the fullscreen lightbox, which the page owns. */
  onExpand: () => void;
}

/**
 * Product image column: main shot with an Amazon-style hover lens and side
 * magnifier, plus the thumbnail rail.
 *
 * The active index is controlled by the page because the lightbox changes it
 * too — the two have to agree on which photo is showing. Everything else (the
 * fade, the lens geometry, the magnified pane) is local, since nothing outside
 * this column has any use for it.
 */
export default function ProductGallery({
  images,
  alt,
  badge,
  index,
  onIndexChange,
  onExpand,
}: ProductGalleryProps) {
  const [opacity, setOpacity] = useState(1);

  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const zoomLensRef = useRef<HTMLDivElement>(null);
  const zoomPaneRef = useRef<HTMLDivElement>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);
  const fadeTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(fadeTimer.current);
    },
    []
  );

  const switchTo = (rawIndex: number) => {
    const len = images.length;
    const next = ((rawIndex % len) + len) % len;
    if (next === index) return;
    setOpacity(0.4);
    window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      onIndexChange(next);
      setOpacity(1);
    }, FADE_MS);
  };

  /* Lens tracks the cursor; the pane paints the same region at ZOOM_FACTOR. */
  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = zoomContainerRef.current;
    const lens = zoomLensRef.current;
    const pane = zoomPaneRef.current;
    const img = mainImgRef.current;
    if (!container || !lens || !img) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensW = rect.width / ZOOM_FACTOR;
    const lensH = rect.height / ZOOM_FACTOR;
    const lensX = Math.min(Math.max(x - lensW / 2, 0), rect.width - lensW);
    const lensY = Math.min(Math.max(y - lensH / 2, 0), rect.height - lensH);

    lens.style.width = `${lensW}px`;
    lens.style.height = `${lensH}px`;
    lens.style.left = `${lensX}px`;
    lens.style.top = `${lensY}px`;

    if (pane) {
      /* Sit the pane beside the image when the viewport has room, else over it. */
      const spaceRight = window.innerWidth - rect.right;
      const fitsBeside = spaceRight >= rect.width + 24;
      pane.style.left = fitsBeside ? "calc(100% + 24px)" : "0px";
      pane.style.width = `${rect.width}px`;
      pane.style.height = `${rect.height}px`;
      pane.style.backgroundImage = `url('${img.src}')`;
      pane.style.backgroundSize = `${rect.width * ZOOM_FACTOR}px ${
        rect.height * ZOOM_FACTOR
      }px`;
      pane.style.backgroundPosition = `${-(lensX * ZOOM_FACTOR)}px ${-(
        lensY * ZOOM_FACTOR
      )}px`;
    }

    container.classList.add("is-zoomed");
  };

  const handleZoomMouseLeave = () => {
    zoomContainerRef.current?.classList.remove("is-zoomed");
  };

  /* Clicking the photo itself opens the lightbox; clicking the chrome on top
     of it (badge, counter, zoom button) must not. */
  const handleZoomContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === mainImgRef.current) onExpand();
  };

  return (
    /* Sticks while the details column scrolls past, releasing at the end of
       the grid row. `self-start` is load-bearing: a grid item stretches to the
       row height by default, which leaves sticky nothing to travel within.
       `top-24` clears the sticky header (56px logo + 32px padding = 88px).
       Only from lg, where the two columns sit side by side — below that they
       stack and sticky would pin the gallery over the details. */
    <div className="lg:col-span-6 lg:sticky lg:top-24 lg:self-start flex flex-col sm:flex-row-reverse gap-3 sm:gap-4 w-full max-w-[520px] mx-auto lg:mx-0">
      <div className="relative flex-1 min-w-0">
        <div
          id="product-zoom-container"
          ref={zoomContainerRef}
          onMouseMove={handleZoomMouseMove}
          onMouseLeave={handleZoomMouseLeave}
          onClick={handleZoomContainerClick}
          className="product-zoom-container relative rounded-[28px] overflow-hidden aspect-3/4 bg-gradient-to-br from-[#FFF9E9] to-[#F4E4D4] ring-1 ring-black/5 shadow-[0_20px_50px_-15px_rgba(20,15,10,0.25)] group"
        >
          <img
            id="main-product-img"
            ref={mainImgRef}
            src={images[index]}
            alt={alt}
            className="w-full h-full object-cover select-none"
            style={{ opacity, transition: "opacity 0.15s ease" }}
          />
          {badge && (
            <span className="absolute top-5 left-5 bg-[#ECA40C] text-[#0A0A0A] text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md pointer-events-none z-10">
              {badge}
            </span>
          )}
          <span
            id="main-gallery-counter"
            className="absolute bottom-5 left-5 z-10 bg-charcoal/75 text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none"
          >
            {index + 1} / {images.length}
          </span>

          {/* Floating Zoom Trigger Badge */}
          <button
            id="open-lightbox-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="absolute bottom-5 right-5 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-charcoal text-xs font-semibold hover:bg-charcoal hover:text-white transition-all shadow-lg group-hover:scale-105"
            aria-label="Expand photo"
          >
            <ZoomIn className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider">
              Hover to Zoom
            </span>
            <span className="sm:hidden text-[11px] uppercase tracking-wider">
              Zoom
            </span>
          </button>

          {/* Rectangular lens box tracking the cursor */}
          <div id="zoom-lens-box" ref={zoomLensRef} className="zoom-lens-box" />
        </div>

        {/* Amazon/Flipkart-style magnified panel */}
        <div id="zoom-pane" ref={zoomPaneRef} className="zoom-pane" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          id="product-thumbnails"
          className="grid grid-cols-4 sm:grid-cols-1 content-start gap-3 sm:w-20 md:w-24 shrink-0"
        >
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => switchTo(idx)}
              className={idx === index ? THUMB_ACTIVE_CLASS : THUMB_INACTIVE_CLASS}
              data-img={src}
              data-index={idx}
            >
              <img
                src={src}
                alt={`View ${idx + 1}`}
                className="w-full h-full object-contain rounded-xl"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
