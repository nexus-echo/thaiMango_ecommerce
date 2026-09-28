"use client";

import type { ReactNode } from "react";
import { useStore } from "./store";

type AuthBrandPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  /* Page-specific foot of the panel (member perks, welcome gift, …) */
  children: ReactNode;
};

/* Left brand column shared by /login and /register: the logo lockup anchors
   the panel, the page's welcome copy sits under it, `children` fills the foot. */
export default function AuthBrandPanel({
  eyebrow,
  title,
  description,
  children,
}: AuthBrandPanelProps) {
  const { settings } = useStore();
  const storeName = settings?.store_name || "Bangkok Mango";

  return (
    <div className="lg:col-span-5 relative bg-burgundy text-white p-8 md:p-12 flex flex-col overflow-hidden">
      {/* Warm mango glow behind the lockup */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[150%] aspect-square rounded-full opacity-30 bg-[radial-gradient(circle,var(--color-mango)_0%,transparent_60%)]"
      />
      {/* Inset hairline frame, like the label border on the packs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 rounded-[28px] border border-gold/15"
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* The lockup carries the wordmark, so no separate store-name text */}
        <img
          src="/brand/logo-dark.svg"
          alt={storeName}
          className="h-24 md:h-32 lg:h-36 w-auto mb-8 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        />

        <span className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase font-bold text-gold mb-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold/40" />
          {eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-gold/40" />
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4">
          {title}
        </h2>
        <p className="text-xs text-white/70 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-10">{children}</div>
    </div>
  );
}
