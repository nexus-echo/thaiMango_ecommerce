"use client";

/**
 * Dashboard chart primitives — plain SVG/CSS, no charting dependency, matching
 * the hand-rolled Sparkline/BarChart already in ./ui.tsx.
 *
 * Colour rules the whole file follows:
 *  · One measure at a time, one hue. There is no dual-axis chart here and no
 *    categorical palette doing a magnitude's job.
 *  · The funnel is an *ordered* scale, so it gets a single-hue ordinal ramp
 *    (validated light→dark against the white card surface, lightest step still
 *    clears 2:1). Nominal bars (top products) get one colour for every bar.
 *  · Payment is the only identity pair; its two hues were checked for
 *    colour-vision separation and both segments are directly labelled.
 *  · Text never wears a series colour — identity comes from the swatch beside
 *    it. Status hues (cancelled, deltas) always ship with an icon or a word.
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, XCircle } from "lucide-react";

export const VIZ = {
  /** Single-series magnitude — the brand amber. */
  series: "#B47404",
  seriesWash: "rgba(180, 116, 4, 0.10)",
  /** Ordered stages, lightest → darkest. */
  stageRamp: ["#E3A63A", "#C98A14", "#A96F04", "#7E5204"],
  /** Reserved status hues — never a series colour. */
  critical: "#D03B3B",
  good: "#0CA30C",
  /** The one identity pair: how the order was paid for. */
  prepaid: "#059669",
  cod: "#D18E0B",
  /** Chrome: one step off the cream surface, hairline and recessive. */
  grid: "#F0E6D8",
  axis: "#DCCAB2",
  ink: "#0A0A0A",
  inkMuted: "#7A6242",
  surface: "#FFFFFF",
} as const;

/* ─────────────────────────── shared helpers ─────────────────────────── */

/** Compact form for axis ticks and tight labels: 940 · 12.9K · 4.2M. */
export function compactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(value));
}

/** A round axis ceiling above `max`, so ticks land on readable numbers. */
function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 1.5, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude;
    if (candidate >= max) return candidate;
  }
  return 10 * magnitude;
}

/** The rendered width of a block, so SVG can be drawn at real pixel sizes
 *  instead of being stretched by a viewBox (which would warp strokes). */
function useChartWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    setWidth(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(Math.round(next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });

/* ───────────────────────────── stat tile ───────────────────────────── */

/** 12-point trail behind a stat tile's number — shape only, no axes. */
function TileSpark({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 104;
  const h = 30;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const points = values.map(
    (v, i) => [i * step, h - 3 - ((v - min) / span) * (h - 6)] as const
  );
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={VIZ.seriesWash} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={4} fill={color} stroke={VIZ.surface} strokeWidth={2} />
    </svg>
  );
}

/**
 * Label · value · signed delta against a named period · trailing sparkline.
 * `upIsGood` is false for measures where a rise is bad, so the colour always
 * means "good/bad", never "up/down" — and an arrow rides along, so the
 * direction never depends on colour alone.
 */
export function StatTile({
  Icon,
  label,
  value,
  delta,
  comparedTo,
  trend,
  upIsGood = true,
  loading = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: number | null;
  comparedTo: string;
  trend: number[];
  upIsGood?: boolean;
  loading?: boolean;
}) {
  const flat = delta === null || delta === 0;
  const positive = (delta ?? 0) > 0;
  const good = positive === upIsGood;
  const DeltaIcon = flat ? ArrowRight : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white rounded-2xl border border-cream shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="w-10 h-10 rounded-2xl bg-cream flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </span>
        {!loading && trend.length > 1 && <TileSpark values={trend} color={VIZ.series} />}
      </div>

      <span className="block text-[11px] font-bold uppercase tracking-widest text-accent mb-1.5">
        {label}
      </span>
      <span className="block font-serif text-3xl font-bold text-charcoal">
        {loading ? "…" : value}
      </span>

      {!loading && (
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          {delta === null ? (
            <span className="text-muted">No {comparedTo} to compare</span>
          ) : (
            <>
              <span
                className="inline-flex items-center gap-0.5 font-bold"
                style={{ color: flat ? VIZ.inkMuted : good ? VIZ.good : VIZ.critical }}
              >
                <DeltaIcon className="w-3.5 h-3.5" />
                {delta > 0 ? "+" : ""}
                {delta}%
              </span>
              <span className="text-muted">vs {comparedTo}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── trend chart ──────────────────────────── */

export interface TrendPoint {
  date: string;
  value: number;
}

/**
 * One measure over time: a 10%-opacity wash under a 2px line, hairline
 * gridlines, and a crosshair that snaps to the nearest day. One series, so no
 * legend — the card title names what is plotted. Arrow keys move the readout,
 * and `view="table"` swaps in the same numbers as a table, so nothing the
 * tooltip shows is reachable only by hovering.
 */
export function TrendChart({
  points,
  seriesLabel,
  formatValue,
  formatTick = compactNumber,
  view = "chart",
  height = 260,
}: {
  points: TrendPoint[];
  seriesLabel: string;
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  view?: "chart" | "table";
  height?: number;
}) {
  const { ref, width } = useChartWidth<HTMLDivElement>();
  const [hovered, setActive] = useState<number | null>(null);

  const pad = { top: 18, right: 18, bottom: 30, left: 56 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = Math.max(0, height - pad.top - pad.bottom);
  const count = points.length;

  /* Clamped on the way out rather than reset in an effect: switching to a
     shorter range must not leave the readout pointing past the last day. */
  const active = hovered !== null && hovered < count ? hovered : null;

  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const xOf = useCallback(
    (i: number) => (count > 1 ? pad.left + (i / (count - 1)) * innerW : pad.left + innerW / 2),
    [count, innerW, pad.left]
  );
  const yOf = useCallback(
    (value: number) => pad.top + innerH - (value / max) * innerH,
    [innerH, max, pad.top]
  );

  const onPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (count === 0 || innerW <= 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left - pad.left) / innerW;
    const index = Math.round(ratio * (count - 1));
    setActive(Math.min(count - 1, Math.max(0, index)));
  };

  const onKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (count === 0) return;
    const from = active ?? count - 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setActive(
        Math.min(count - 1, Math.max(0, from + (event.key === "ArrowLeft" ? -1 : 1)))
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(count - 1);
    } else if (event.key === "Escape") {
      setActive(null);
    }
  };

  if (view === "table") {
    return (
      <div className="max-h-75 overflow-y-auto -mx-1">
        <table className="w-full text-sm">
          <caption className="sr-only">{seriesLabel} by day</caption>
          <thead className="sticky top-0 bg-ivory">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="font-semibold px-3 py-2">Day</th>
              <th className="font-semibold px-3 py-2 text-right">{seriesLabel}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date} className="border-b border-cream/60 last:border-0">
                <td className="px-3 py-2 text-muted whitespace-nowrap">
                  {dayLabel(point.date)}
                </td>
                <td className="px-3 py-2 text-right text-charcoal tabular-nums">
                  {formatValue(point.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(p.value)}`)
    .join(" ");
  const areaPath = count
    ? `${linePath} L${xOf(count - 1)},${pad.top + innerH} L${xOf(0)},${pad.top + innerH} Z`
    : "";

  /* First, last, and a handful between — never a tick per day, and never more
     than the width can hold: ~90px per label keeps "23 Oct" from colliding
     with its neighbour on a phone-width card. */
  const labelSlots = Math.max(2, Math.floor(innerW / 90));
  const tickEvery = Math.max(1, Math.ceil(count / labelSlots));
  const activePoint = active !== null ? points[active] : undefined;
  const tooltipLeft = active !== null ? xOf(active) : 0;

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && count > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          tabIndex={0}
          aria-label={`${seriesLabel} per day — ${formatValue(
            points[points.length - 1].value
          )} on ${dayLabel(points[points.length - 1].date)}`}
          onPointerMove={onPointer}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKeyDown}
          className="touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-lg"
        >
          {/* Gridlines + y ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = pad.top + innerH - fraction * innerH;
            return (
              <g key={fraction}>
                <line
                  x1={pad.left}
                  x2={pad.left + innerW}
                  y1={y}
                  y2={y}
                  stroke={fraction === 0 ? VIZ.axis : VIZ.grid}
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize={10}
                  fill={VIZ.inkMuted}
                  className="tabular-nums"
                >
                  {formatTick(max * fraction)}
                </text>
              </g>
            );
          })}

          {/* x ticks */}
          {points.map((point, i) =>
            i % tickEvery === 0 || i === count - 1 ? (
              <text
                key={point.date}
                x={xOf(i)}
                y={height - 10}
                textAnchor={i === 0 ? "start" : i === count - 1 ? "end" : "middle"}
                fontSize={10}
                fill={VIZ.inkMuted}
              >
                {dayLabel(point.date)}
              </text>
            ) : null
          )}

          <path d={areaPath} fill={VIZ.seriesWash} />
          <path
            d={linePath}
            fill="none"
            stroke={VIZ.series}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Resting end-dot, with a surface ring so it reads over the line */}
          <circle
            cx={xOf(count - 1)}
            cy={yOf(points[count - 1].value)}
            r={4}
            fill={VIZ.series}
            stroke={VIZ.surface}
            strokeWidth={2}
          />

          {/* Crosshair */}
          {active !== null && activePoint && (
            <g>
              <line
                x1={xOf(active)}
                x2={xOf(active)}
                y1={pad.top}
                y2={pad.top + innerH}
                stroke={VIZ.axis}
                strokeWidth={1}
              />
              <circle
                cx={xOf(active)}
                cy={yOf(activePoint.value)}
                r={5}
                fill={VIZ.series}
                stroke={VIZ.surface}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      )}

      {/* Readout — values lead, the series name follows */}
      {active !== null && activePoint && width > 0 && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-xl border border-cream bg-white shadow-md px-3 py-2 whitespace-nowrap"
          style={{
            /* Kept clear of both edges so the readout never spills the card. */
            left: Math.min(Math.max(tooltipLeft, 84), Math.max(width - 84, 84)),
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {dayLabel(activePoint.date)}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="w-3 h-0.5 rounded-full shrink-0"
              style={{ background: VIZ.series }}
            />
            <span className="text-sm font-bold text-charcoal tabular-nums">
              {formatValue(activePoint.value)}
            </span>
            <span className="text-[11px] text-muted">{seriesLabel}</span>
          </div>
        </div>
      )}

      {width > 0 && count === 0 && (
        <p className="py-16 text-center text-sm text-muted">No data in this range.</p>
      )}
    </div>
  );
}

/* ────────────────────────── fulfilment funnel ─────────────────────── */

export interface StageRow {
  status: string;
  label: string;
  orders: number;
  revenue: number;
}

/**
 * Orders by stage. The stages are ordered, so colour steps along a single-hue
 * ordinal ramp rather than picking an arbitrary hue per stage; the stage name
 * and count are always on screen, so the ramp is never load-bearing.
 * Cancelled sits off the scale and wears the reserved critical hue with an
 * icon, because it is a state, not the next step.
 */
export function StageBars({
  stages,
  cancelled,
  formatMoney,
}: {
  stages: StageRow[];
  cancelled: { orders: number; revenue: number };
  formatMoney: (value: number) => string;
}) {
  const peak = Math.max(1, ...stages.map((s) => s.orders), cancelled.orders);
  const totalOrders = stages.reduce((sum, s) => sum + s.orders, 0) + cancelled.orders;
  const share = (orders: number) =>
    totalOrders > 0 ? Math.round((orders / totalOrders) * 100) : 0;

  const rows: (StageRow & { color: string; critical?: boolean })[] = [
    ...stages.map((stage, i) => ({ ...stage, color: VIZ.stageRamp[i] })),
    {
      status: "CANCELLED",
      label: "Cancelled",
      orders: cancelled.orders,
      revenue: cancelled.revenue,
      color: VIZ.critical,
      critical: true,
    },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.status}
          className="grid grid-cols-[92px_1fr_auto] items-center gap-3 group"
          title={`${row.label}: ${row.orders} order${row.orders === 1 ? "" : "s"}${
            row.critical ? "" : ` · ${formatMoney(row.revenue)}`
          }`}
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
            {row.critical ? (
              <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: VIZ.critical }} />
            ) : (
              <span
                className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                style={{ background: row.color }}
              />
            )}
            {row.label}
          </span>

          <span className="relative block h-5 rounded-sm bg-cream/60 overflow-hidden">
            <span
              className="absolute inset-y-0 left-0 rounded-r-sm transition-[width,filter] duration-300 group-hover:brightness-110"
              style={{
                width: `${Math.max(row.orders > 0 ? 3 : 0, (row.orders / peak) * 100)}%`,
                background: row.color,
              }}
            />
          </span>

          <span className="text-xs text-charcoal tabular-nums whitespace-nowrap">
            <strong className="font-bold">{row.orders}</strong>
            <span className="text-muted"> · {share(row.orders)}%</span>
          </span>
        </div>
      ))}

      {totalOrders === 0 && (
        <p className="py-4 text-center text-sm text-muted">No orders in this range.</p>
      )}
    </div>
  );
}

/* ───────────────────────────── payment mix ────────────────────────── */

/**
 * Prepaid vs cash-on-delivery as one part-to-whole bar — two values, so a pie
 * would be the wrong form. The two hues clear colour-vision separation on this
 * surface and both segments carry a written label, so neither relies on hue.
 */
export function PaymentSplit({
  payments,
  formatMoney,
}: {
  payments: { method: string; orders: number; revenue: number }[];
  formatMoney: (value: number) => string;
}) {
  const total = payments.reduce((sum, p) => sum + p.orders, 0);
  const meta: Record<string, { label: string; color: string }> = {
    PREPAID: { label: "Prepaid", color: VIZ.prepaid },
    COD: { label: "Cash on delivery", color: VIZ.cod },
  };

  if (total === 0) {
    return <p className="py-4 text-center text-sm text-muted">No orders in this range.</p>;
  }

  return (
    <div>
      {/* 2px surface gap does the separating — no strokes around the segments */}
      <div className="flex h-5 rounded-sm overflow-hidden" style={{ gap: 2 }}>
        {payments
          .filter((p) => p.orders > 0)
          .map((p) => (
            <span
              key={p.method}
              className="h-full first:rounded-l-sm last:rounded-r-sm transition-[filter] hover:brightness-110"
              style={{
                width: `${(p.orders / total) * 100}%`,
                background: meta[p.method]?.color ?? VIZ.series,
              }}
              title={`${meta[p.method]?.label ?? p.method}: ${p.orders} order${
                p.orders === 1 ? "" : "s"
              } · ${formatMoney(p.revenue)}`}
            />
          ))}
      </div>

      <dl className="mt-3 space-y-1.5">
        {payments.map((p) => (
          <div key={p.method} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-[3px] shrink-0"
              style={{ background: meta[p.method]?.color ?? VIZ.series }}
            />
            <dt className="text-charcoal font-semibold">
              {meta[p.method]?.label ?? p.method}
            </dt>
            <dd className="ml-auto text-muted tabular-nums">
              {Math.round((p.orders / total) * 100)}% · {p.orders} · {formatMoney(p.revenue)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ──────────────────────────── top products ───────────────────────── */

export interface RankRow {
  key: string;
  name: string;
  slug: string | null;
  image: string;
  units: number;
  revenue: number;
}

/**
 * Products ranked by revenue. The categories are nominal, so every bar is the
 * same hue — length already carries the magnitude, and a darker-where-bigger
 * ramp would spend the colour channel saying it twice.
 */
export function RankBars({
  rows,
  formatMoney,
}: {
  rows: RankRow[];
  formatMoney: (value: number) => string;
}) {
  const peak = Math.max(1, ...rows.map((r) => r.revenue));

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        No products sold in this range.
      </p>
    );
  }

  return (
    <ol className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.key} className="group">
          <div className="flex items-center gap-3 mb-1.5">
            <img
              src={row.image}
              alt=""
              className="w-8 h-8 rounded-lg object-cover bg-cream shrink-0"
            />
            <span className="min-w-0 flex-1 text-sm font-medium text-charcoal truncate">
              {row.name}
            </span>
            <span className="text-xs text-muted tabular-nums shrink-0">
              {row.units} unit{row.units === 1 ? "" : "s"}
            </span>
            <span className="text-sm font-bold text-charcoal tabular-nums shrink-0">
              {formatMoney(row.revenue)}
            </span>
          </div>
          <span
            className="relative block h-2.5 rounded-sm bg-cream/60 overflow-hidden ml-11"
            title={`${row.name}: ${formatMoney(row.revenue)} from ${row.units} unit${
              row.units === 1 ? "" : "s"
            }`}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-r-sm transition-[width,filter] duration-300 group-hover:brightness-110"
              style={{
                width: `${Math.max(3, (row.revenue / peak) * 100)}%`,
                background: VIZ.series,
              }}
            />
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ──────────────────────── filter / toggle row ────────────────────── */

/** Pill group used for the range presets and the metric switch. */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 p-1 rounded-full bg-ivory border border-cream"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            value === option.value
              ? "bg-accent text-white shadow-sm shadow-accent/25"
              : "text-muted hover:bg-cream"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
