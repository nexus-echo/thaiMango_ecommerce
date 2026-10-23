import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { productImage } from "@/lib/images";

/** Ranges the dashboard's preset row offers; anything else falls back. */
const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];
const DEFAULT_RANGE: Range = 30;

const DAY_MS = 86_400_000;

const ORDER_STAGES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

/** A day bucket's key — UTC, so a server in any timezone splits the same
 *  orders into the same days and the chart never shifts under a deploy. */
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const startOfUtcDay = (date: Date) =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

/** Share of `value` against `base`, as a signed percentage, rounded to 0.1. */
function deltaPct(value: number, base: number): number | null {
    /* Growth from nothing has no meaningful percentage — the tile shows the
       raw figures instead of a misleading "+100%". */
    if (base <= 0) return null;
    return Math.round(((value - base) / base) * 1000) / 10;
}

/**
 * GET /api/admin/analytics?range=30
 *
 * Everything the dashboard's charts plot, for one trailing window plus the
 * equal-length window before it (so each stat can carry a period-over-period
 * delta). Revenue excludes CANCELLED orders, matching /api/admin/stats.
 *
 * Rows are bucketed in JS rather than with date_trunc in SQL: the window is at
 * most 90 days of orders, and keeping it in Prisma keeps the route typed and
 * portable. Revisit with a raw aggregate if order volume outgrows that.
 */
export async function GET(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const requested = Number(new URL(req.url).searchParams.get("range"));
        const days: Range =
            (RANGES as readonly number[]).includes(requested)
                ? (requested as Range)
                : DEFAULT_RANGE;

        const today = startOfUtcDay(new Date());
        /* The window is inclusive of today, so a 7-day range is today and the
           six days before it. */
        const from = addDays(today, -(days - 1));
        const previousFrom = addDays(from, -days);

        const [orders, signups, lines] = await Promise.all([
            /* Both windows in one query — the split happens per row below. */
            prisma.order.findMany({
                where: { created_at: { gte: previousFrom } },
                select: {
                    created_at: true,
                    total: true,
                    status: true,
                    payment: true,
                },
            }),
            prisma.user.findMany({
                where: { role: "CUSTOMER", created_at: { gte: previousFrom } },
                select: { created_at: true },
            }),
            /* Line-level revenue can't be summed by the database (it needs
               price × quantity), so the current window's lines come back raw. */
            prisma.orderItem.findMany({
                where: {
                    order: { created_at: { gte: from }, status: { not: "CANCELLED" } },
                },
                select: {
                    name: true,
                    price: true,
                    quantity: true,
                    product: { select: { id: true, slug: true, images: true, name_en: true } },
                },
            }),
        ]);

        /* ── Daily series ───────────────────────────────────────────────── */

        const series = Array.from({ length: days }, (_, i) => ({
            date: dayKey(addDays(from, i)),
            revenue: 0,
            orders: 0,
            customers: 0,
        }));
        const byDay = new Map(series.map((row) => [row.date, row]));

        const current = { revenue: 0, orders: 0, customers: 0 };
        const previous = { revenue: 0, orders: 0, customers: 0 };

        const stageCounts: Record<string, { orders: number; revenue: number }> = {};
        const paymentCounts: Record<string, { orders: number; revenue: number }> = {};

        for (const order of orders) {
            const inWindow = order.created_at >= from;
            const bucket = inWindow ? current : previous;
            const total = Number(order.total);
            /* A cancelled order still happened — it counts as an order and in
               the stage breakdown, but never toward revenue. */
            const earned = order.status === "CANCELLED" ? 0 : total;

            bucket.orders += 1;
            bucket.revenue += earned;

            if (!inWindow) continue;

            const row = byDay.get(dayKey(order.created_at));
            if (row) {
                row.orders += 1;
                row.revenue += earned;
            }

            const stage = (stageCounts[order.status] ??= { orders: 0, revenue: 0 });
            stage.orders += 1;
            stage.revenue += earned;

            const method = (paymentCounts[order.payment] ??= { orders: 0, revenue: 0 });
            method.orders += 1;
            method.revenue += earned;
        }

        for (const signup of signups) {
            const inWindow = signup.created_at >= from;
            (inWindow ? current : previous).customers += 1;
            if (!inWindow) continue;
            const row = byDay.get(dayKey(signup.created_at));
            if (row) row.customers += 1;
        }

        /* ── Top products ───────────────────────────────────────────────── */

        const ranked = new Map<
            string,
            { key: string; name: string; slug: string | null; image: string; units: number; revenue: number }
        >();
        for (const line of lines) {
            /* Lines whose product has since been deleted still sold — they are
               grouped under the name the order recorded. */
            const key = line.product?.id ?? `name:${line.name}`;
            const entry =
                ranked.get(key) ??
                ranked
                    .set(key, {
                        key,
                        name: line.product?.name_en ?? line.name,
                        slug: line.product?.slug ?? null,
                        image: productImage(line.product?.images),
                        units: 0,
                        revenue: 0,
                    })
                    .get(key)!;
            entry.units += line.quantity;
            entry.revenue += Number(line.price) * line.quantity;
        }
        const topProducts = [...ranked.values()]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);

        /* ── Shapes the charts consume ──────────────────────────────────── */

        const aov = current.orders > 0 ? current.revenue / current.orders : 0;
        const previousAov =
            previous.orders > 0 ? previous.revenue / previous.orders : 0;

        const stages = ORDER_STAGES.map((status) => ({
            status,
            orders: stageCounts[status]?.orders ?? 0,
            revenue: stageCounts[status]?.revenue ?? 0,
        }));

        const payload = {
            range: { days, from: from.toISOString(), to: new Date().toISOString() },
            series,
            totals: {
                revenue: current.revenue,
                orders: current.orders,
                customers: current.customers,
                aov,
            },
            previous: {
                revenue: previous.revenue,
                orders: previous.orders,
                customers: previous.customers,
                aov: previousAov,
            },
            deltas: {
                revenue: deltaPct(current.revenue, previous.revenue),
                orders: deltaPct(current.orders, previous.orders),
                customers: deltaPct(current.customers, previous.customers),
                aov: deltaPct(aov, previousAov),
            },
            stages,
            cancelled: {
                orders: stageCounts.CANCELLED?.orders ?? 0,
                revenue: stageCounts.CANCELLED?.revenue ?? 0,
            },
            payments: (["PREPAID", "COD"] as const).map((method) => ({
                method,
                orders: paymentCounts[method]?.orders ?? 0,
                revenue: paymentCounts[method]?.revenue ?? 0,
            })),
            topProducts,
        };

        const apiResponse = new ApiResponse(200, payload, "Analytics fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin analytics fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
