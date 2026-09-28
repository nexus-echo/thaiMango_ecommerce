import type { NextRequest } from "next/server";
import { startOAuth } from "@/lib/oauth";

export function GET(req: NextRequest) {
    return startOAuth(req, "line");
}
