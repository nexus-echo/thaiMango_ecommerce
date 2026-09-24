import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/jwt";

/** The signed-in user's session from the cookie, or null for guests. */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}
