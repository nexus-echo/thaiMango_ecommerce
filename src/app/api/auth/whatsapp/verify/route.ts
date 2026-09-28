import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { toE164, whatsappVerifySchema } from "@/schemas/whatsapp.schema";
import { OTP_MAX_ATTEMPTS, otpMatches } from "@/lib/whatsapp";
import { findUserByEmail, signInWithIdentity } from "@/lib/socialAuth";
import { setSessionCookie } from "@/lib/session";

const TOO_MANY = "Too many incorrect attempts. Request a new code.";

/* Step 2 of "Continue with WhatsApp": check the code and sign in.
   A number that isn't linked to an account yet gets { needs_profile: true }
   back (the code stays valid); the client asks for a name and sends the
   same code again with `profile`, which creates the account. */
export async function POST(req: Request) {
    try {
        const parsed = whatsappVerifySchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, parsed.error.issues[0]?.message ?? "Check the code and try again");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        const { code, profile } = parsed.data;
        const phone = toE164(parsed.data.phone)!;

        const otp = await prisma.phoneOtp.findUnique({ where: { phone } });
        if (!otp || otp.expires_at <= new Date()) {
            const apiError = new ApiError(400, "This code has expired. Request a new one.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        if (otp.attempts >= OTP_MAX_ATTEMPTS) {
            await prisma.phoneOtp.deleteMany({ where: { phone } });
            const apiError = new ApiError(429, TOO_MANY);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        if (!otpMatches(phone, code, otp.code_hash)) {
            const left = OTP_MAX_ATTEMPTS - (otp.attempts + 1);
            if (left > 0) {
                await prisma.phoneOtp.update({ where: { phone }, data: { attempts: { increment: 1 } } });
            } else {
                await prisma.phoneOtp.deleteMany({ where: { phone } });
            }
            const apiError = new ApiError(
                400,
                left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` : TOO_MANY
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const linked = await prisma.authAccount.findUnique({
            where: { provider_provider_account_id: { provider: "WHATSAPP", provider_account_id: phone } },
            select: { id: true },
        });

        if (!linked) {
            if (!profile) {
                const apiResponse = new ApiResponse(
                    200,
                    { needs_profile: true },
                    "Almost there — tell us your name."
                );
                return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
            }
            if (profile.email && (await findUserByEmail(profile.email))) {
                const apiError = new ApiError(
                    409,
                    "An account with this email already exists. Sign in with it instead, or leave email blank."
                );
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
        }

        /* Burn the code before signing in, so two racing requests can't both use it. */
        const { count } = await prisma.phoneOtp.deleteMany({
            where: { phone, code_hash: otp.code_hash },
        });
        if (count === 0) {
            const apiError = new ApiError(400, "This code has already been used. Request a new one.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const result = await signInWithIdentity({
            provider: "WHATSAPP",
            providerAccountId: phone,
            name: profile ? `${profile.f_name} ${profile.l_name}` : "",
            email: profile?.email || null,
            emailVerified: false,
            phone: parsed.data.phone,
        });
        if ("error" in result) {
            const apiError = new ApiError(result.status, result.error);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const apiResponse = new ApiResponse(200, result.user, "Signed in with WhatsApp");
        const response = NextResponse.json(apiResponse, { status: apiResponse.statusCode });
        setSessionCookie(response, { sub: result.user.id, role: result.user.role });
        return response;
    } catch (error) {
        console.error("WhatsApp sign-in failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
