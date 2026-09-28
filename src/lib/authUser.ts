import type { AuthUser } from "@/lib/site-data";

/** A user as /api/me, /api/login and the WhatsApp sign-in return it. */
export interface ApiUser {
    id: string;
    name: string;
    /** Null for WhatsApp / LINE sign-ups that never gave one. */
    email: string | null;
    phone: string;
    role: "ADMIN" | "CUSTOMER";
    flavor_preference: string[];
    created_at: string;
}

export function toAuthUser(u: ApiUser): AuthUser {
    const [firstName, ...rest] = u.name.split(" ");
    return {
        isLoggedIn: true,
        id: u.id,
        firstName,
        lastName: rest.join(" "),
        name: u.name,
        email: u.email ?? undefined,
        phone: u.phone,
        skinType: u.flavor_preference?.[0],
        memberSince: new Date(u.created_at).getFullYear().toString(),
        role: u.role,
    };
}
