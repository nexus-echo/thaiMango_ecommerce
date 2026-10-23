"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ChevronLeft,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  User,
} from "lucide-react";
import Select from "react-select";
import { useMoney } from "@/components/admin/useMoney";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { adminSelectStyles, SelectOption } from "@/components/admin/selectStyles";
import { productImage } from "@/lib/images";
import { formatMoney, isCurrencyCode } from "@/lib/currency";
import { unwrap } from "@/lib/http";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface AdminOrderItem {
  id: number;
  product_id: string | null;
  name: string;
  variant_label: string | null;
  price: string;
  quantity: number;
  product: { slug: string; images: string[] } | null;
}

interface AdminOrderDetail {
  id: string;
  order_no: number;
  status: OrderStatus;
  payment: "PREPAID" | "COD";
  total: string;
  charge_currency: string;
  charge_total: string;
  payment_ref: string | null;
  created_at: string;
  updated_at: string;
  ship_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  ship_country: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    created_at: string;
    order_count: number;
  };
  items: AdminOrderItem[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_OPTIONS: SelectOption[] = (
  Object.entries(STATUS_LABEL) as [OrderStatus, string][]
).map(([value, label]) => ({ value, label }));

/* The lifecycle an order walks through, drawn as a timeline. Cancelled sits
   outside it, so a cancelled order shows that instead of the trail. */
const TIMELINE: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const dateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* Label/value row used in the customer, shipping and payment panels. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-0.5">
        {label}
      </span>
      <span className="block text-sm text-charcoal break-words">{children}</span>
    </div>
  );
}

function PanelTitle({
  Icon,
  title,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-xl bg-cream flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </span>
        <h2 className="font-serif text-lg text-charcoal">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { format: money } = useMoney();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const orderQuery = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => unwrap<AdminOrderDetail>(axios.get(`/api/admin/orders/${id}`)),
    enabled: Boolean(id),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      unwrap<unknown>(axios.patch(`/api/admin/orders/${id}`, { status })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const order = orderQuery.data;

  const backLink = (
    <Link
      href="/admin/orders"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-burgundy transition mb-6"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to orders
    </Link>
  );

  if (orderQuery.isPending) {
    return (
      <>
        {backLink}
        <PageHeader title="Order" subtitle="Loading…" />
        <Card className="p-12 text-center text-sm text-muted">Loading order…</Card>
      </>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <>
        {backLink}
        <PageHeader title="Order" subtitle="Not found" />
        <Card className="p-12 text-center text-sm text-muted">
          {orderQuery.error instanceof Error
            ? orderQuery.error.message
            : "This order could not be loaded."}
        </Card>
      </>
    );
  }

  const orderNo = `TM-${String(order.order_no).padStart(5, "0")}`;
  const total = Number(order.total);
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  /* Only the final total is stored, so shipping and any discount can only be
     shown as the one net adjustment between the lines and what was charged. */
  const adjustment = total - subtotal;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const chargeTotal = Number(order.charge_total);
  const chargeCurrency = order.charge_currency;
  /* Shown next to the base-currency total only when a charge was recorded. */
  const charged =
    chargeTotal > 0 && isCurrencyCode(chargeCurrency)
      ? formatMoney(chargeTotal, chargeCurrency)
      : null;

  const currentStep = TIMELINE.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <>
      {backLink}

      <PageHeader title={orderNo} subtitle={`Placed ${dateTime(order.created_at)}`}>
        <StatusBadge status={STATUS_LABEL[order.status]} />
        <div className="w-[170px]">
          <Select<SelectOption>
            instanceId={`order-detail-status-${order.id}`}
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find((s) => s.value === order.status)}
            isDisabled={statusMutation.isPending}
            isSearchable={false}
            styles={adminSelectStyles}
            menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
            onChange={(opt) => {
              if (!opt || opt.value === order.status) return;
              setServerError("");
              statusMutation.mutate(opt.value);
            }}
            aria-label={`Update status of order ${orderNo}`}
          />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-10 h-10 rounded-xl border border-cream bg-white flex items-center justify-center text-muted hover:text-accent hover:border-accent transition"
          aria-label="Print order"
        >
          <Printer className="w-4 h-4" />
        </button>
      </PageHeader>

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {/* Lifecycle */}
      <Card className="p-5 md:p-6 mb-6">
        {cancelled ? (
          <div className="flex items-center gap-2.5 text-sm text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Cancelled on {dateTime(order.updated_at)}
          </div>
        ) : (
          <ol className="flex items-center">
            {TIMELINE.map((step, i) => {
              const done = i <= currentStep;
              return (
                <li
                  key={step}
                  className={`flex items-center ${
                    i === TIMELINE.length - 1 ? "" : "flex-1"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition ${
                        done
                          ? "bg-accent text-white border-accent"
                          : "bg-white text-muted border-cream"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                        done ? "text-charcoal" : "text-muted/70"
                      }`}
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <span
                      className={`flex-1 h-0.5 mx-2 -mt-5 rounded-full ${
                        i < currentStep ? "bg-accent" : "bg-cream"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Items + totals */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-5 pb-0">
              <PanelTitle Icon={Package} title="Items">
                <span className="text-xs font-semibold text-muted whitespace-nowrap">
                  {itemCount} unit{itemCount === 1 ? "" : "s"} · {order.items.length} line
                  {order.items.length === 1 ? "" : "s"}
                </span>
              </PanelTitle>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-y border-cream bg-ivory">
                    <th className="font-semibold px-5 py-3">Product</th>
                    <th className="font-semibold px-5 py-3">Price</th>
                    <th className="font-semibold px-5 py-3">Qty</th>
                    <th className="font-semibold px-5 py-3 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-cream/60 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={productImage(item.product?.images)}
                            alt={item.name}
                            className="w-11 h-11 rounded-lg object-cover bg-cream shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal truncate max-w-[220px]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-muted">
                              {item.variant_label ?? "—"}
                              {item.product ? (
                                <Link
                                  href={`/product-detail/${item.product.slug}`}
                                  target="_blank"
                                  className="ml-2 inline-flex items-center gap-1 text-accent hover:text-burgundy font-semibold transition"
                                >
                                  View
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              ) : (
                                <span className="ml-2 text-muted/70">product removed</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {money(Number(item.price))}
                      </td>
                      <td className="px-5 py-3.5 text-muted">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-charcoal whitespace-nowrap">
                        {money(Number(item.price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                  {order.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted">
                        This order has no line items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-cream bg-ivory px-5 py-4">
              <dl className="ml-auto w-full sm:w-72 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Items subtotal</dt>
                  <dd className="text-charcoal">{money(subtotal)}</dd>
                </div>
                {adjustment !== 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">
                      {adjustment > 0 ? "Shipping" : "Discount"}
                    </dt>
                    <dd className={adjustment > 0 ? "text-charcoal" : "text-emerald-600"}>
                      {adjustment > 0 ? "" : "−"}
                      {money(Math.abs(adjustment))}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-cream">
                  <dt className="font-semibold text-charcoal">Total</dt>
                  <dd className="font-serif text-lg font-bold text-charcoal">
                    {money(total)}
                  </dd>
                </div>
                {charged && (
                  <div className="flex justify-between">
                    <dt className="text-[11px] uppercase tracking-wider font-semibold text-muted">
                      Charged
                    </dt>
                    <dd className="text-xs font-semibold text-muted">
                      {charged} {chargeCurrency}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Card>
        </div>

        {/* Side panels */}
        <div className="space-y-4 md:space-y-5">
          <Card className="p-5">
            <PanelTitle Icon={User} title="Customer" />
            <div className="space-y-3">
              <Field label="Name">{order.user.name}</Field>
              <Field label="Email">
                {order.user.email ? (
                  <a
                    href={`mailto:${order.user.email}`}
                    className="inline-flex items-center gap-1.5 text-accent hover:text-burgundy transition"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {order.user.email}
                  </a>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Phone">
                <a
                  href={`tel:${order.user.phone}`}
                  className="inline-flex items-center gap-1.5 text-accent hover:text-burgundy transition"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {order.user.phone}
                </a>
              </Field>
              <Field label="Customer since">
                {new Date(order.user.created_at).toLocaleDateString("en-IN")} ·{" "}
                {order.user.order_count} order{order.user.order_count === 1 ? "" : "s"}
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <PanelTitle Icon={MapPin} title="Shipping" />
            <div className="space-y-3">
              <Field label="Recipient">{order.ship_name}</Field>
              <Field label="Phone">
                <a
                  href={`tel:${order.ship_phone}`}
                  className="text-accent hover:text-burgundy transition"
                >
                  {order.ship_phone}
                </a>
              </Field>
              <Field label="Address">
                {order.ship_line1}
                <br />
                {order.ship_city}, {order.ship_state} {order.ship_pincode}
                <br />
                {order.ship_country}
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <PanelTitle Icon={CreditCard} title="Payment" />
            <div className="space-y-3">
              <Field label="Method">
                <span
                  className={`text-xs font-semibold ${
                    order.payment === "COD" ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {order.payment === "COD" ? "Cash on delivery" : "Prepaid"}
                </span>
              </Field>
              <Field label="Reference">
                <span className="font-mono text-xs break-all">
                  {order.payment_ref ?? "—"}
                </span>
              </Field>
              <Field label="Last updated">{dateTime(order.updated_at)}</Field>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
