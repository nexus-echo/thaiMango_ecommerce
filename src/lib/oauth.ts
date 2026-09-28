import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse, type NextRequest } from "next/server";
import { RETURN_TO_PARAM, safeReturnTo } from "@/lib/safeReturnTo";
import { setSessionCookie } from "@/lib/session";
import { signInWithIdentity, type ProviderIdentity } from "@/lib/socialAuth";

/*
 * "Continue with Google / LINE" — OAuth 2.0 authorization-code flow with PKCE.
 *
 *   /api/auth/<provider>           → sets a signed flow cookie, redirects to the provider
 *   /api/auth/<provider>/callback  → checks state, swaps the code for tokens, reads the
 *                                    profile, signs the user in, redirects to ?next= or /dashboard
 *
 * Failures land back on /login (or /register) as ?auth_error=<message>, which
 * SocialAuthButtons shows as a toast.
 */

export type OAuthProviderId = "google" | "line";

type Tokens = { access_token: string; id_token?: string };

interface OAuthProvider {
    label: string;
    clientId: () => string | undefined;
    clientSecret: () => string | undefined;
    authorizeUrl: string;
    tokenUrl: string;
    scope: string;
    extraParams?: Record<string, string>;
    identity: (tokens: Tokens, ctx: { clientId: string; nonce: string }) => Promise<ProviderIdentity>;
}

const PROVIDERS: Record<OAuthProviderId, OAuthProvider> = {
    google: {
        label: "Google",
        clientId: () => process.env.GOOGLE_CLIENT_ID,
        clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scope: "openid email profile",
        extraParams: { prompt: "select_account" },
        async identity(tokens) {
            const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`Google userinfo ${res.status}: ${await res.text()}`);
            const info = (await res.json()) as {
                sub: string;
                email?: string;
                email_verified?: boolean;
                name?: string;
            };
            return {
                provider: "GOOGLE",
                providerAccountId: info.sub,
                name: info.name ?? info.email?.split("@")[0] ?? "",
                email: info.email,
                emailVerified: info.email_verified === true,
            };
        },
    },
    line: {
        label: "LINE",
        clientId: () => process.env.LINE_CHANNEL_ID,
        clientSecret: () => process.env.LINE_CHANNEL_SECRET,
        authorizeUrl: "https://access.line.me/oauth2/v2.1/authorize",
        tokenUrl: "https://api.line.me/oauth2/v2.1/token",
        /* `email` is only honoured once the channel's email permission is approved
           in the LINE Developers console; without it LINE simply omits the email. */
        scope: "profile openid email",
        async identity(tokens, { clientId, nonce }) {
            if (!tokens.id_token) throw new Error("LINE returned no id_token");
            /* LINE's verify endpoint checks the signature, audience, expiry and nonce. */
            const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ id_token: tokens.id_token, client_id: clientId, nonce }),
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`LINE verify ${res.status}: ${await res.text()}`);
            const claims = (await res.json()) as { sub: string; name?: string; email?: string };
            return {
                provider: "LINE",
                providerAccountId: claims.sub,
                name: claims.name ?? "",
                email: claims.email,
                /* LINE only releases addresses the user has confirmed with LINE. */
                emailVerified: Boolean(claims.email),
            };
        },
    },
};

const FLOW_TTL_SECONDS = 10 * 60;
const flowCookie = (id: OAuthProviderId) => `oauth_${id}`;
const FLOW_COOKIE_PATH = "/api/auth";

interface FlowState {
    state: string;
    verifier: string;
    nonce: string;
    next: string | null;
    from: "login" | "register";
}

const randomToken = () => crypto.randomBytes(32).toString("base64url");

/**
 * The site's public origin, for the redirect_uri the provider calls back to.
 * APP_URL wins (set it in production — it must match the URI registered with
 * Google / LINE); otherwise it's rebuilt from the proxy headers.
 */
function appOrigin(req: NextRequest): string {
    const configured = process.env.APP_URL?.replace(/\/+$/, "");
    if (configured) return configured;
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const proto =
        req.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
        req.nextUrl.protocol.replace(":", "");
    return host ? `${proto}://${host}` : req.nextUrl.origin;
}

const callbackUrl = (req: NextRequest, id: OAuthProviderId) =>
    `${appOrigin(req)}/api/auth/${id}/callback`;

/* Relative Location headers, so redirects stay on whatever host the browser used. */
function redirectTo(path: string) {
    return new NextResponse(null, { status: 303, headers: { Location: path } });
}

function backWithError(from: FlowState["from"], next: string | null, message: string) {
    const params = new URLSearchParams({ auth_error: message });
    if (next) params.set(RETURN_TO_PARAM, next);
    return redirectTo(`/${from}?${params}`);
}

/** GET /api/auth/<provider>?from=login|register&next=/path */
export function startOAuth(req: NextRequest, id: OAuthProviderId) {
    const cfg = PROVIDERS[id];
    const from = req.nextUrl.searchParams.get("from") === "register" ? "register" : "login";
    const next = safeReturnTo(req.nextUrl.searchParams.get(RETURN_TO_PARAM));

    const clientId = cfg.clientId();
    if (!clientId || !cfg.clientSecret()) {
        return backWithError(from, next, `${cfg.label} sign-in isn't set up yet.`);
    }

    const flow: FlowState = { state: randomToken(), verifier: randomToken(), nonce: randomToken(), next, from };
    const challenge = crypto.createHash("sha256").update(flow.verifier).digest("base64url");

    const url = new URL(cfg.authorizeUrl);
    url.search = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: callbackUrl(req, id),
        scope: cfg.scope,
        state: flow.state,
        nonce: flow.nonce,
        code_challenge: challenge,
        code_challenge_method: "S256",
        ...cfg.extraParams,
    }).toString();

    const response = redirectTo(url.toString());
    response.cookies.set(
        flowCookie(id),
        jwt.sign(flow, process.env.JWT_SECRET as string, { expiresIn: FLOW_TTL_SECONDS }),
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            /* lax: the cookie must ride along on the provider's top-level redirect back. */
            sameSite: "lax",
            path: FLOW_COOKIE_PATH,
            maxAge: FLOW_TTL_SECONDS,
        }
    );
    return response;
}

function readFlow(req: NextRequest, id: OAuthProviderId): FlowState | null {
    const token = req.cookies.get(flowCookie(id))?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return typeof decoded === "string" ? null : (decoded as unknown as FlowState);
    } catch {
        return null;
    }
}

/** GET /api/auth/<provider>/callback?code=…&state=… */
export async function finishOAuth(req: NextRequest, id: OAuthProviderId) {
    const cfg = PROVIDERS[id];
    const flow = readFlow(req, id);
    const from = flow?.from ?? "login";
    const next = flow?.next ?? null;

    /* The flow cookie is single-use whatever happens. */
    const done = (response: NextResponse) => {
        response.cookies.delete({ name: flowCookie(id), path: FLOW_COOKIE_PATH });
        return response;
    };
    const fail = (message: string) => done(backWithError(from, next, message));

    const params = req.nextUrl.searchParams;
    if (params.get("error")) {
        /* access_denied = the user pressed Cancel on the consent screen. */
        return fail(
            params.get("error") === "access_denied"
                ? `${cfg.label} sign-in was cancelled.`
                : `${cfg.label} sign-in failed. Please try again.`
        );
    }

    const code = params.get("code");
    const state = params.get("state");
    if (!flow || !code || !state || state !== flow.state) {
        return fail("Your sign-in session expired. Please try again.");
    }

    const clientId = cfg.clientId();
    const clientSecret = cfg.clientSecret();
    if (!clientId || !clientSecret) return fail(`${cfg.label} sign-in isn't set up yet.`);

    try {
        const tokenRes = await fetch(cfg.tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: callbackUrl(req, id),
                client_id: clientId,
                client_secret: clientSecret,
                code_verifier: flow.verifier,
            }),
            cache: "no-store",
        });
        if (!tokenRes.ok) {
            throw new Error(`${cfg.label} token exchange ${tokenRes.status}: ${await tokenRes.text()}`);
        }
        const tokens = (await tokenRes.json()) as Tokens;

        const identity = await cfg.identity(tokens, { clientId, nonce: flow.nonce });
        const result = await signInWithIdentity(identity);
        if ("error" in result) return fail(result.error);

        const response = redirectTo(next ?? "/dashboard");
        setSessionCookie(response, { sub: result.user.id, role: result.user.role });
        return done(response);
    } catch (error) {
        console.error(`${cfg.label} sign-in failed:`, error);
        return fail(`${cfg.label} sign-in failed. Please try again.`);
    }
}
