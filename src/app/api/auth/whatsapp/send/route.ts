import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { toE164, whatsappSendSchema } from "@/schemas/whatsapp.schema";
import {
    OTP_RESEND_MS,
    OTP_TTL_MS,
    generateOtp,
    hashOtp,
    sendWhatsAppOtp,
    whatsappAvailable,
} from "@/lib/whatsapp";

/* Step 1 of "Continue with WhatsApp": send a 6-digit code to the number.
   One live code per number; asking again within a minute is refused. */
export async function POST(req: Request) {
    try {
        const parsed = whatsappSendSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, parsed.error.issues[0]?.message ?? "Enter a valid number");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        const phone = toE164(parsed.data.phone)!;

        if (!whatsappAvailable()) {
            const apiError = new ApiError(503, "WhatsApp sign-in isn't set up yet.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const current = await prisma.phoneOtp.findUnique({ where: { phone } });
        const waitMs = current ? current.created_at.getTime() + OTP_RESEND_MS - Date.now() : 0;
        if (waitMs > 0) {
            const apiError = new ApiError(
                429,
                `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const code = generateOtp();
        const record = {
            code_hash: hashOtp(phone, code),
            attempts: 0,
            expires_at: new Date(Date.now() + OTP_TTL_MS),
            created_at: new Date(),
        };
        await prisma.phoneOtp.upsert({
            where: { phone },
            create: { phone, ...record },
            update: record,
        });

        try {
            await sendWhatsAppOtp(phone, code);
        } catch (error) {
            console.error("WhatsApp OTP send failed:", error);
            await prisma.phoneOtp.delete({ where: { phone } });
            const apiError = new ApiError(
                502,
                "We couldn't send a WhatsApp message to that number. Check it and try again."
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const apiResponse = new ApiResponse(
            200,
            { resend_in: OTP_RESEND_MS / 1000 },
            "We've sent a code to your WhatsApp."
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("WhatsApp OTP request failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
