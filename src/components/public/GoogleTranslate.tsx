"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useStore } from "./store";

/* Whole-page Thai via Google's Website Translator. The page renders in
   English and Google translates all of it in place; our hand-written Thai
   (translations + name_th fields) is only the fallback when the widget
   can't load (store.machineTranslate). The EN/TH buttons stay the only
   control: this component follows the store's `lang` and keeps Google's
   own UI hidden (globals.css). Public pages only — admin stays English. */

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => unknown;
      };
    };
  }
}

const COOKIE = "googtrans";
const TO_THAI = "/en/th";
/* Blocked (ad-blocker, offline, region)? Fall back after this long. */
const LOAD_TIMEOUT_MS = 10000;

/* Google wraps translated text in <font> elements, so React can later try to
   remove or insert around a node that is no longer where it left it and
   crash the page. Skip those operations instead (facebook/react#11538). */
if (typeof window !== "undefined" && !("__translatePatched" in Node.prototype)) {
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
  Object.defineProperty(Node.prototype, "__translatePatched", { value: true });
}

/* Google reads the cookie on the host and on the parent domain. */
function cookieDomains() {
  const host = window.location.hostname;
  return host === "localhost" || /^[\d.]+$/.test(host) ? [""] : ["", `; domain=${host}`, `; domain=.${host}`];
}

function setThaiCookie() {
  for (const domain of cookieDomains()) document.cookie = `${COOKIE}=${TO_THAI}; path=/${domain}`;
}

function clearThaiCookie() {
  for (const domain of cookieDomains()) {
    document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain}`;
  }
}

const thaiCookieSet = () => document.cookie.split("; ").some((c) => c === `${COOKIE}=${TO_THAI}`);

/* The widget's hidden <select>; choosing "th" translates without a reload. */
function selectThai(): boolean {
  const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!combo) return false;
  combo.value = "th";
  combo.dispatchEvent(new Event("change"));
  return true;
}

export default function GoogleTranslate() {
  const { lang, mounted, machineTranslate, setMachineTranslate } = useStore();

  useEffect(() => {
    /* Before `mounted` the store still holds its "en" default, not the saved
       choice — acting on it would reload a Thai visitor back to English. */
    if (!mounted || !machineTranslate) return;

    if (lang === "th") {
      setThaiCookie();
      /* The widget may still be loading; it also picks the cookie up itself. */
      let tries = 0;
      const timer = window.setInterval(() => {
        if (selectThai() || ++tries > 20) window.clearInterval(timer);
      }, 250);
      return () => window.clearInterval(timer);
    }

    /* Back to English: Google can only undo its translation by reloading. */
    if (thaiCookieSet() || document.documentElement.classList.contains("translated-ltr")) {
      clearThaiCookie();
      window.location.reload();
    }
  }, [lang, mounted, machineTranslate]);

  /* No widget in time → the hand-written Thai takes over. */
  useEffect(() => {
    if (!mounted) return;
    const timer = window.setTimeout(() => {
      if (!window.google?.translate) setMachineTranslate(false);
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, setMachineTranslate]);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "th", autoDisplay: false },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      {/* Loaded after hydration so Google never rewrites server HTML before
          React has claimed it. */}
      {mounted && (
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
          onError={() => setMachineTranslate(false)}
        />
      )}
    </>
  );
}
