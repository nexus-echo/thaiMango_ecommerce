import { prisma } from "@/lib/prismaClient";
import type { AuthProvider, User } from "@/generated/prisma/client";

/** What a provider tells us about the person signing in. */
export interface ProviderIdentity {
    provider: AuthProvider;
    /** Google `sub`, LINE user id, or the E.164 WhatsApp number. */
    providerAccountId: string;
    name: string;
    email?: string | null;
    /** Only a provider-verified email is trusted to link to an existing account. */
    emailVerified?: boolean;
    phone?: string;
}

export type SafeUser = Omit<User, "password_hash">;

type SignInResult = { user: SafeUser } | { error: string; status: number };

const ADMIN_BLOCKED =
    "Admin accounts sign in with email and password only.";

function strip(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safe } = user;
    return safe;
}

export function findUserByEmail(email: string) {
    return prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: "insensitive" } },
    });
}

/**
 * Finds the account an identity belongs to, linking or creating one as needed:
 *   1. an account already linked to this provider identity;
 *   2. else an existing account with the same provider-verified email (the
 *      identity is linked to it, so the customer keeps their orders);
 *   3. else a brand-new customer account.
 * Admin accounts are never reachable this way — like password resets, admins
 * only get in with their password.
 */
export async function signInWithIdentity(identity: ProviderIdentity): Promise<SignInResult> {
    const key = {
        provider: identity.provider,
        provider_account_id: identity.providerAccountId,
    };

    const linked = await prisma.authAccount.findUnique({
        where: { provider_provider_account_id: key },
        include: { user: true },
    });
    if (linked) {
        if (linked.user.role === "ADMIN") return { error: ADMIN_BLOCKED, status: 403 };
        return { user: strip(linked.user) };
    }

    const email = identity.email?.trim().toLowerCase() || null;
    /* Sign-up stores emails as typed, so match without regard to case. */
    const existing = email ? await findUserByEmail(email) : null;

    if (existing && identity.emailVerified) {
        if (existing.role === "ADMIN") return { error: ADMIN_BLOCKED, status: 403 };
        await prisma.authAccount.create({ data: { ...key, user_id: existing.id } });
        return { user: strip(existing) };
    }

    const user = await prisma.user.create({
        data: {
            name: identity.name.trim() || "Mango Lover",
            /* An unverified email must not claim an address someone else registered. */
            email: existing ? null : email,
            phone: identity.phone ?? "",
            flavor_preference: [],
            authAccounts: { create: key },
        },
    });
    return { user: strip(user) };
}
