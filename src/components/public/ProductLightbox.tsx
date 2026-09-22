"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

const THUMB_ACTIVE_CLASS =
  "lightbox-thumb border-2 border-accent rounded-xl overflow-hidden w-14 h-14 bg-white/10 shrink-0 p-0.5 transition opacity-100";
const THUMB_INACTIVE_CLASS =
  "lightbox-thumb border border-white/20 hover:border-accent rounded-xl overflow-hidden w-14 h-14 bg-white/10 shrink-0 p-0.5 transition opacity-60 hover:opacity-100";

const MAX_SCALE = 3.5;
const SCALE_STEP = 0.5;
/** What a double-click jumps to, and back from. */
const DOUBLE_CLICK_SCALE = 2.5;

interface ProductLightboxProps {
  open: boolean;
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Fullscreen photo viewer: zoom buttons, double-click to zoom, drag to pan,
 * arrow keys and Escape.
 *
 * Zoom and pan are refs rather than state on purpose — they change on every
 * mousemove while dragging, and re-rendering a full-screen image at that rate
 * is visibly worse than writing the transform straight to the node.
 *
 * Stays mounted and hidden so the browser keeps the decoded image around; the
 * page renders it outside <main> so nothing on the page can clip it.
 */
export default function ProductLightbox({
  open,
  images,
  alt,
  index,
  onIndexChange,
  onClose,
}: ProductLightboxProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const applyTransform = () => {
    const img = imgRef.current;
    if (!img) return;
    const scale = scaleRef.current;
    const { x, y } = translateRef.current;
    /* Divide by scale so a drag moves the image by the distance the cursor
       travelled, not that distance multiplied by the zoom. */
    img.style.transform = `scale(${scale}) translate(${x / scale}px, ${y / scale}px)`;
  };

  const reset = () => {
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    applyTransform();
  };

  const zoomBy = (delta: number) => {
    scaleRef.current = Math.min(MAX_SCALE, Math.max(1, scaleRef.current + delta));
    if (scaleRef.current === 1) translateRef.current = { x: 0, y: 0 };
    applyTransform();
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    scaleRef.current = scaleRef.current > 1 ? 1 : DOUBLE_CLICK_SCALE;
    if (scaleRef.current === 1) translateRef.current = { x: 0, y: 0 };
    applyTransform();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const step = (delta: number) => {
    const len = images.length;
    onIndexChange((((index + delta) % len) + len) % len);
  };

  /* Every open starts at 1x, and the page underneath stops scrolling. */
  useEffect(() => {
    if (!open) return;
    reset();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images.length]);

  /* Drag-to-pan is tracked on the window so the pointer can leave the image
     mid-drag without the gesture sticking. */
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || scaleRef.current <= 1) return;
      translateRef.current = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      applyTransform();
    };
    const onMouseUp = () => {
      draggingRef.current = false;
      wrapperRef.current?.classList.remove("is-dragging");
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scaleRef.current <= 1) return;
    draggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - translateRef.current.x,
      y: e.clientY - translateRef.current.y,
    };
    wrapperRef.current?.classList.add("is-dragging");
  };

  return (
    <div
      id="product-lightbox"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className={`fixed inset-0 z-[200] bg-charcoal/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8 transition-all duration-300 ${
        open ? "" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center z-10 max-w-7xl mx-auto w-full text-white">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-[#FFE490] font-bold">
            Zoom View
          </span>
          <span className="text-white/40">•</span>
          <span
            id="lightbox-counter"
            className="text-xs text-white/70 font-semibold tracking-wider"
          >
            {index + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="lightbox-zoom-out"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomBy(-SCALE_STEP);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            id="lightbox-zoom-in"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomBy(SCALE_STEP);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            id="lightbox-reset-zoom"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider uppercase text-white transition"
          >
            Reset
          </button>
          <button
            id="close-lightbox"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition ml-2"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Stage */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4">
        {images.length > 1 && (
          <button
            id="lightbox-prev"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          id="lightbox-img-wrapper"
          ref={wrapperRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          onMouseDown={handleMouseDown}
          className="lightbox-img-wrapper flex items-center justify-center max-w-full max-h-full"
        >
          <img
            id="lightbox-img"
            ref={imgRef}
            src={images[index]}
            alt={alt}
            onDoubleClick={handleDoubleClick}
            className="max-h-[75vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
          />
        </div>

        {images.length > 1 && (
          <button
            id="lightbox-next"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="z-10 flex justify-center items-center gap-3 overflow-x-auto py-2 no-scrollbar">
          {images.map((src, idx) => (
            <button
              key={`${src}-lb-${idx}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange(idx);
              }}
              className={idx === index ? THUMB_ACTIVE_CLASS : THUMB_INACTIVE_CLASS}
              data-src={src}
              data-index={idx}
            >
              <img src={src} className="w-full h-full object-contain rounded-lg" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
