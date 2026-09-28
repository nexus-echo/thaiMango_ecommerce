"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/public/store";
import { GoogleIcon, LineIcon, WhatsAppIcon } from "@/components/public/BrandIcons";
import WhatsAppAuthDialog from "@/components/public/WhatsAppAuthDialog";
import { RETURN_TO_PARAM, useReturnTo } from "@/lib/returnTo";

const buttonCls =
  "flex items-center justify-center gap-2.5 py-3 px-4 rounded-full border border-cream hover:border-charcoal hover:bg-cream/40 transition text-xs font-semibold text-charcoal shadow-sm";

/**
 * Google / WhatsApp / LINE row shared by /login and /register. Google and LINE
 * are full-page OAuth redirects through /api/auth/<provider>; WhatsApp opens
 * the one-time-code dialog. Either way the customer lands on ?next= or /dashboard.
 */
export default function SocialAuthButtons({ mode }: { mode: "login" | "register" }) {
  const { showToast } = useStore();
  const returnTo = useReturnTo();
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  /* A failed Google / LINE round trip comes back as ?auth_error=… —
     show it once, then drop it so a refresh doesn't repeat the toast. */
  useEffect(() => {
    const url = new URL(window.location.href);
    const message = url.searchParams.get("auth_error");
    if (!message) return;
    showToast(message);
    url.searchParams.delete("auth_error");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [showToast]);

  const oauthHref = (provider: "google" | "line") => {
    const params = new URLSearchParams({ from: mode });
    if (returnTo) params.set(RETURN_TO_PARAM, returnTo);
    return `/api/auth/${provider}?${params}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href={oauthHref("google")} className={buttonCls}>
          <GoogleIcon className="w-4 h-4" />
          <span>Google</span>
        </a>
        <button type="button" onClick={() => setWhatsAppOpen(true)} className={buttonCls}>
          <WhatsAppIcon className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>
        <a href={oauthHref("line")} className={buttonCls}>
          <LineIcon className="w-4 h-4" />
          <span>LINE</span>
        </a>
      </div>
      <WhatsAppAuthDialog open={whatsAppOpen} onClose={() => setWhatsAppOpen(false)} />
    </>
  );
}
