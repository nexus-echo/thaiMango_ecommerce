import { useSyncExternalStore } from "react";
import { RETURN_TO_PARAM, safeReturnTo } from "@/lib/safeReturnTo";

/* Client-side helpers for `?next=`; the validation itself is in safeReturnTo.ts. */

export { RETURN_TO_PARAM, safeReturnTo };

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
