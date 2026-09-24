import { useSyncExternalStore } from "react";

/* "Send me back where I was" for the sign-in / sign-up pages, carried as
   `?next=/some/path`. Only same-site paths are honoured — anything else
   (https://evil.com, //evil.com, /\evil.com) is dropped, so the parameter
   can't be used to bounce people off-site after they sign in. */

export const RETURN_TO_PARAM = "next";

export function safeReturnTo(value: string | null | undefined): string | null {
    if (!value) return null;
    if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
        return null;
    }
    /* Never loop back to the auth pages themselves. */
    if (/^\/(login|register)(\/|\?|#|$)/.test(value)) return null;
    return value;
}

/** Reads `?next=` from the current URL (client only). */
export function readReturnTo(): string | null {
    if (typeof window === "undefined") return null;
    return safeReturnTo(new URLSearchParams(window.location.search).get(RETURN_TO_PARAM));
}

const noopSubscribe = () => () => {};

/** `?next=` as a hook — null during SSR/hydration, the real value after, so
 *  links that carry it on can render without a hydration mismatch. */
export function useReturnTo(): string | null {
    return useSyncExternalStore(noopSubscribe, readReturnTo, () => null);
}

/** `/login` + return address → `/login?next=%2Fproduct-detail%2F…` */
export function withReturnTo(href: string, next: string | null): string {
    const safe = safeReturnTo(next);
    return safe ? `${href}?${RETURN_TO_PARAM}=${encodeURIComponent(safe)}` : href;
}
