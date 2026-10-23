"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  CreditCard,
  ListFilter,
  MessageSquare,
  Package,
  Receipt,
  ShoppingBag,
  Star,
  Trophy,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useMoney } from "@/components/admin/useMoney";
import { Card, PageHeader, SectionTitle, StatCard } from "@/components/admin/ui";
import {
  compactNumber,
  PaymentSplit,
  RankBars,
  RankRow,
  StageBars,
  StatTile,
  ToggleGroup,
  TrendChart,
} from "@/components/admin/charts";
import { unwrap } from "@/lib/http";

interface Stats {
  products: number;
  activeProducts: number;
  categories: number;
  customers: number;
  outOfStock: number;
  lowStock: number;
  orders: number;
  revenue: number;
  pendingReviews: number;
}

interface Analytics {
  range: { days: number; from: string; to: string };
  series: { date: string; revenue: number; orders: number; customers: number }[];
  totals: { revenue: number; orders: number; customers: number; aov: number };
  previous: { revenue: number; orders: number; customers: number; aov: number };
  deltas: {
    revenue: number | null;
    orders: number | null;
    customers: number | null;
    aov: number | null;
  };
  stages: { status: string; orders: number; revenue: number }[];
  cancelled: { orders: number; revenue: number };
  payments: { method: string; orders: number; revenue: number }[];
  topProducts: RankRow[];
}

interface AdminOrder {
  id: string;
  order_no: number;
  status: string;
  total: string;
  created_at: string;
  user: { name: string; email: string };
}

interface AdminReview {
  id: number;
  rating: number;
  status: string;
  product: { name_en: string };
  user: { name: string };
}

type Metric = "revenue" | "orders" | "customers";

const RANGE_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "orders", label: "Orders" },
  { value: "customers", label: "New customers" },
];

const STAGE_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

/** Condenses a daily series to ~12 buckets, so a 90-day sparkline still reads
 *  as a shape instead of a scribble. Buckets are summed, not averaged — the
 *  tile's number is a total, so its trail should be too. */
function sparkSeries(values: number[], buckets = 12): number[] {
  if (values.length <= buckets) return values;
  const size = Math.ceil(values.length / buckets);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) {
    out.push(values.slice(i, i + size).reduce((sum, v) => sum + v, 0));
  }
  return out;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= n ? "text-amber-400 fill-amber-400" : "text-muted/50"
          }`}
        />
      ))}
    </span>
  );
}

export default function DashboardPage() {
  const { format: money, symbol } = useMoney();
  const [range, setRange] = useState("30");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [trendView, setTrendView] = useState<"chart" | "table">("chart");

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => unwrap<Stats>(axios.get("/api/admin/stats")),
  });

  const analyticsQuery = useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: () =>
      unwrap<Analytics>(axios.get("/api/admin/analytics", { params: { range } })),
    /* Switching range holds the previous render instead of flashing a skeleton. */
    placeholderData: keepPreviousData,
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => unwrap<AdminOrder[]>(axios.get("/api/admin/orders")),
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => unwrap<AdminReview[]>(axios.get("/api/admin/reviews")),
  });

  const stats = statsQuery.data;
  const analytics = analyticsQuery.data;
  const loadingAnalytics = analyticsQuery.isPending;
  /* A refetch keeps the frame — same layout, lower opacity, no jump. */
  const stale = analyticsQuery.isFetching && !analyticsQuery.isPending;

  const days = Number(range);
  const comparedTo = `prev ${days} days`;
  const series = analytics?.series ?? [];

  const metricConfig: Record<
    Metric,
    { label: string; formatValue: (v: number) => string; formatTick: (v: number) => string }
  > = {
    revenue: {
      label: "Revenue",
      formatValue: money,
      formatTick: (v) => `${symbol}${compactNumber(v)}`,
    },
    orders: {
      label: "Orders",
      formatValue: (v) => String(Math.round(v)),
      formatTick: compactNumber,
    },
    customers: {
      label: "New customers",
      formatValue: (v) => String(Math.round(v)),
      formatTick: compactNumber,
    },
  };
  const active = metricConfig[metric];

  /* Tile trails. Average order value is a ratio, so its buckets are summed
     revenue over summed orders — averaging the daily averages would weight a
     one-order day the same as a fifty-order day. */
  const revenueTrend = sparkSeries(series.map((d) => d.revenue));
  const ordersTrend = sparkSeries(series.map((d) => d.orders));
  const aovTrend = revenueTrend.map((revenue, i) =>
    ordersTrend[i] > 0 ? revenue / ordersTrend[i] : 0
  );

  return (
    <>
      <PageHeader title="Overview" subtitle="Real-time platform performance" />

      {(stats?.outOfStock || stats?.lowStock || stats?.pendingReviews) ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          {stats.outOfStock + stats.lowStock > 0 && (
            <span>
              <strong>
                {stats.outOfStock} out of stock, {stats.lowStock} low stock
              </strong>{" "}
              — check the{" "}
              <Link href="/admin/inventory" className="underline">
                inventory
              </Link>
              .{" "}
            </span>
          )}
          {stats.pendingReviews > 0 && (
            <span>
              <strong>
                {stats.pendingReviews} review{stats.pendingReviews === 1 ? "" : "s"}
              </strong>{" "}
              awaiting{" "}
              <Link href="/admin/reviews" className="underline">
                moderation
              </Link>
              .
            </span>
          )}
        </div>
      ) : null}

      {/* All-time KPIs — deliberately above the range filter, which scopes
          only what sits below it. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-8">
        <StatCard
          Icon={TrendingUp}
          chip="Live"
          label="Total Revenue"
          value={stats ? money(stats.revenue) : "…"}
        />
        <StatCard
          Icon={ShoppingBag}
          chip="Total"
          label="Orders"
          value={stats ? String(stats.orders) : "…"}
        />
        <StatCard
          Icon={Package}
          chip="Catalog"
          label="Products"
          value={stats ? String(stats.products) : "…"}
        />
        <StatCard
          Icon={Users}
          chip="Growth"
          label="Customers"
          value={stats ? String(stats.customers) : "…"}
        />
      </div>

      {/* Filter row — one row, above everything it scopes */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted">
          <ListFilter className="w-3.5 h-3.5" />
          Period
        </span>
        <ToggleGroup
          label="Date range"
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
        />
        <span className="text-xs text-muted">
          Last {days} days, compared with the {days} before
        </span>
      </div>

      <div
        className={`transition-opacity duration-200 ${stale ? "opacity-60" : "opacity-100"}`}
      >
        {/* Period KPIs with period-over-period deltas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-5">
          <StatTile
            Icon={TrendingUp}
            label="Revenue"
            value={money(analytics?.totals.revenue ?? 0)}
            delta={analytics?.deltas.revenue ?? null}
            comparedTo={comparedTo}
            trend={revenueTrend}
            loading={loadingAnalytics}
          />
          <StatTile
            Icon={ShoppingBag}
            label="Orders"
            value={String(analytics?.totals.orders ?? 0)}
            delta={analytics?.deltas.orders ?? null}
            comparedTo={comparedTo}
            trend={ordersTrend}
            loading={loadingAnalytics}
          />
          <StatTile
            Icon={Receipt}
            label="Avg order value"
            value={money(Math.round(analytics?.totals.aov ?? 0))}
            delta={analytics?.deltas.aov ?? null}
            comparedTo={comparedTo}
            trend={aovTrend}
            loading={loadingAnalytics}
          />
          <StatTile
            Icon={UserPlus}
            label="New customers"
            value={String(analytics?.totals.customers ?? 0)}
            delta={analytics?.deltas.customers ?? null}
            comparedTo={comparedTo}
            trend={sparkSeries(series.map((d) => d.customers))}
            loading={loadingAnalytics}
          />
        </div>

        {/* Trend — one measure at a time, so there is never a second y-axis */}
        <Card className="p-5 md:p-6 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-cream flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-accent" />
              </span>
              <h2 className="font-serif text-lg text-charcoal">
                {active.label} per day
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <ToggleGroup
                label="Metric"
                options={METRIC_OPTIONS}
                value={metric}
                onChange={setMetric}
              />
              <button
                type="button"
                onClick={() =>
                  setTrendView((v) => (v === "chart" ? "table" : "chart"))
                }
                className="px-3.5 py-1.5 rounded-full border border-cream text-xs font-semibold text-muted hover:text-accent hover:border-accent transition"
              >
                {trendView === "chart" ? "Table view" : "Chart view"}
              </button>
            </div>
          </div>

          {loadingAnalytics ? (
            <p className="py-20 text-center text-sm text-muted">Loading…</p>
          ) : (
            <TrendChart
              points={series.map((d) => ({ date: d.date, value: d[metric] }))}
              seriesLabel={active.label}
              formatValue={active.formatValue}
              formatTick={active.formatTick}
              view={trendView}
            />
          )}
        </Card>

        {/* Composition + ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-5">
          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-xl bg-cream flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-accent" />
              </span>
              <h2 className="font-serif text-lg text-charcoal">Order breakdown</h2>
            </div>

            <span className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
              By stage
            </span>
            {loadingAnalytics ? (
              <p className="py-8 text-center text-sm text-muted">Loading…</p>
            ) : (
              <StageBars
                stages={(analytics?.stages ?? []).map((s) => ({
                  ...s,
                  label: STAGE_LABEL[s.status] ?? s.status,
                }))}
                cancelled={analytics?.cancelled ?? { orders: 0, revenue: 0 }}
                formatMoney={money}
              />
            )}

            <div className="mt-6 pt-5 border-t border-cream">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
                <CreditCard className="w-3.5 h-3.5" />
                By payment
              </span>
              {loadingAnalytics ? (
                <p className="py-4 text-center text-sm text-muted">Loading…</p>
              ) : (
                <PaymentSplit payments={analytics?.payments ?? []} formatMoney={money} />
              )}
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-xl bg-cream flex items-center justify-center">
                <Trophy className="w-4 h-4 text-accent" />
              </span>
              <h2 className="font-serif text-lg text-charcoal">
                Top products by revenue
              </h2>
            </div>
            {loadingAnalytics ? (
              <p className="py-20 text-center text-sm text-muted">Loading…</p>
            ) : (
              <RankBars rows={analytics?.topProducts ?? []} formatMoney={money} />
            )}
          </Card>
        </div>
      </div>

      {/* Recent orders + reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Recent Orders */}
        <Card className="p-5 md:p-6">
          <SectionTitle
            Icon={ShoppingBag}
            title="Recent Orders"
            actionHref="/admin/orders"
          />
          <div className="space-y-3">
            {ordersQuery.isPending ? (
              <p className="text-sm text-muted py-6 text-center">Loading…</p>
            ) : (ordersQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No orders yet — they&apos;ll appear here once customers start ordering.
              </p>
            ) : (
              (ordersQuery.data ?? []).slice(0, 4).map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-cream hover:border-accent/50 hover:bg-cream/40 transition group"
                >
                  <span className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-muted/70 shrink-0">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-charcoal uppercase tracking-wide truncate">
                      Order #TM-{String(o.order_no).padStart(5, "0")}
                    </div>
                    <div className="text-xs text-muted/70 font-medium">
                      {money(Number(o.total))} · {o.user.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-muted">
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-accent">
                      {o.status}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted/50 group-hover:text-accent transition shrink-0" />
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card className="p-5 md:p-6">
          <SectionTitle
            Icon={MessageSquare}
            title="Recent Reviews"
            actionHref="/admin/reviews"
          />
          <div className="space-y-3">
            {reviewsQuery.isPending ? (
              <p className="text-sm text-muted py-6 text-center">Loading…</p>
            ) : (reviewsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No reviews yet — they&apos;ll appear here once customers start reviewing.
              </p>
            ) : (
              (reviewsQuery.data ?? []).slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-cream hover:border-accent/50 hover:bg-cream/40 transition group"
                >
                  <span className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-muted/70 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-charcoal truncate">
                      {r.product.name_en}
                    </div>
                    <div className="text-xs text-muted/70 font-medium">{r.user.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <Stars n={r.rating} />
                    <div className="text-[11px] font-bold uppercase tracking-wide text-accent mt-1">
                      {r.status}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted/50 group-hover:text-accent transition shrink-0" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
