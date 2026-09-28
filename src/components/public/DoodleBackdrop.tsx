import type { CSSProperties } from "react";

/* Faint tiled line art behind a section (graffiti on the dark headers,
   doodles on the light bodies of the info pages). The SVG is used as a mask
   over `currentColor`, so one file tints to any token via className
   (`text-gold`, `text-accent`) and opacity sets how light it sits.
   `fade` keeps the art away from the copy. The parent needs
   `relative overflow-hidden`, and the content after it `relative`. */
const FADES = {
  none: undefined,
  /* clear behind centred copy, strongest at the corners */
  center: "radial-gradient(ellipse at center, rgb(0 0 0 / 0.1) 25%, #000 75%)",
  /* only the side gutters, for text that runs straight on the background */
  edges: "linear-gradient(90deg, #000 0%, transparent 30%, transparent 70%, #000 100%)",
};

export default function DoodleBackdrop({
  src,
  tile = 420,
  fade = "none",
  className = "",
}: {
  src: string;
  tile?: number;
  fade?: keyof typeof FADES;
  className?: string;
}) {
  const art: CSSProperties = {
    maskImage: `url(${src})`,
    maskSize: `${tile}px ${tile}px`,
    maskRepeat: "repeat",
  };
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ maskImage: FADES[fade] }}
    >
      <div className="absolute inset-0 bg-current" style={art} />
    </div>
  );
}
