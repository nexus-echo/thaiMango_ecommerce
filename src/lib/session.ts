import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
    verifySessionToken,
    signSessionToken,
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_SECONDS,
    SessionPayload,
} from "@/lib/jwt";

/** The signed-in user's session from the cookie, or null for guests. */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

/** Signs the user in on `response` — same cookie /api/login and /api/sign-up set. */
export function setSessionCookie(response: NextResponse, payload: SessionPayload) {
    response.cookies.set(SESSION_COOKIE_NAME, signSessionToken(payload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}
