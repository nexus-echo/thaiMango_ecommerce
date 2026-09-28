import type { NextRequest } from "next/server";
import { finishOAuth } from "@/lib/oauth";

export function GET(req: NextRequest) {
    return finishOAuth(req, "google");
}
