/* "Send me back where I was" for the sign-in / sign-up pages, carried as
   `?next=/some/path`. Only same-site paths are honoured — anything else
   (https://evil.com, //evil.com, /\evil.com) is dropped, so the parameter
   can't be used to bounce people off-site after they sign in.

   Kept free of React so route handlers (the OAuth callbacks) can use it too;
   the client hooks live in returnTo.ts. */

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
