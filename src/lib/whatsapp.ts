import crypto from "crypto";

/*
 * "Continue with WhatsApp" = a one-time code sent through the WhatsApp Cloud
 * API (Meta). It needs an approved template in the "Authentication" category
 * with a Copy-code button; env:
 *   WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_OTP_TEMPLATE,
 *   optional WHATSAPP_OTP_TEMPLATE_LANG (default en_US), WHATSAPP_API_VERSION.
 * Unconfigured outside production, the code is logged to the server console
 * instead so the flow stays testable locally (same idea as the mailer).
 */

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtp(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Keyed hash, so a leaked table can't be brute-forced back to live codes. */
export function hashOtp(phone: string, code: string): string {
    return crypto
        .createHmac("sha256", process.env.JWT_SECRET as string)
        .update(`${phone}:${code}`)
        .digest("hex");
}

export function otpMatches(phone: string, code: string, storedHash: string): boolean {
    const a = Buffer.from(hashOtp(phone, code), "hex");
    const b = Buffer.from(storedHash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function whatsappConfig() {
    const {
        WHATSAPP_PHONE_NUMBER_ID,
        WHATSAPP_ACCESS_TOKEN,
        WHATSAPP_OTP_TEMPLATE,
        WHATSAPP_OTP_TEMPLATE_LANG,
        WHATSAPP_API_VERSION,
    } = process.env;
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN || !WHATSAPP_OTP_TEMPLATE) return null;
    return {
        phoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
        token: WHATSAPP_ACCESS_TOKEN,
        template: WHATSAPP_OTP_TEMPLATE,
        lang: WHATSAPP_OTP_TEMPLATE_LANG || "en_US",
        version: WHATSAPP_API_VERSION || "v23.0",
    };
}

/** False only in production without WhatsApp credentials. */
export function whatsappAvailable(): boolean {
    return Boolean(whatsappConfig()) || process.env.NODE_ENV !== "production";
}

/** Sends `code` to `phone` (E.164). Throws if Meta rejects the message. */
export async function sendWhatsAppOtp(phone: string, code: string): Promise<void> {
    const cfg = whatsappConfig();
    if (!cfg) {
        console.log(`[whatsapp] Not configured — sign-in code for ${phone}: ${code}`);
        return;
    }

    const res = await fetch(`https://graph.facebook.com/${cfg.version}/${cfg.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${cfg.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone.replace(/^\+/, ""),
            type: "template",
            template: {
                name: cfg.template,
                language: { code: cfg.lang },
                /* Authentication templates take the code twice: the body
                   placeholder and the Copy-code button. */
                components: [
                    { type: "body", parameters: [{ type: "text", text: code }] },
                    {
                        type: "button",
                        sub_type: "url",
                        index: "0",
                        parameters: [{ type: "text", text: code }],
                    },
                ],
            },
        }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`WhatsApp send ${res.status}: ${await res.text()}`);
    }
}
