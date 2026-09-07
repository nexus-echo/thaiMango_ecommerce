"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Citrus,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useStore } from "@/components/public/store";
import { defaultVariant } from "@/lib/variants";
import { productImage } from "@/lib/images";
import { tipsForPreference } from "@/lib/flavor-tips";
import PhoneField from "@/components/common/PhoneField";
import PasswordInput from "@/components/common/PasswordInput";
import { unwrap } from "@/lib/http";
import CtaBanner from "@/components/public/CtaBanner";

type TabKey =
  | "overview"
  | "orders"
  | "wishlist"
  | "addresses"
  | "skin-profile"
  | "settings";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

interface MyOrderItem {
  id: number;
  name: string;
  variant_label: string | null;
  price: string;
  quantity: number;
  product: { slug: string; images: string[] } | null;
}

interface MyOrder {
  id: string;
  order_no: number;
  status: OrderStatus;
  payment: "PREPAID" | "COD";
  total: string;
  created_at: string;
  ship_name: string;
  ship_line1: string;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  ship_country: string;
  items: MyOrderItem[];
}

interface MyAddress {
  id: number;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface ShopProduct {
  slug: string;
  name_en: string;
  name_th: string;
  description_en: string;
  description_th: string;
  images: string[];
  category?: { slug: string; name_en: string; name_th: string } | null;
  productVariant: { label: string; price: string; is_default: boolean; stock: number }[];
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Confirmed",
  PROCESSING: "Being Packed",
  SHIPPED: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_STEP: Record<OrderStatus, number> = {
  PENDING: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 0,
};

/* Soft tinted status chips. The hues are semantic (they encode order state,
   not brand), which is why they sit outside the maroon/gold palette. */
const STATUS_PILL: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-sky-50 text-sky-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const TRACK_STEPS = ["Confirmed", "Packed", "In Transit", "Delivered"];

const TABS: { key: TabKey; label: string; icon: IconType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "My Orders", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "skin-profile", label: "Flavor Profile", icon: Citrus },
  { key: "settings", label: "Settings", icon: Settings },
];

const TAB_META: Record<TabKey, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "Track what is on its way and pick up where you left off.",
  },
  orders: {
    title: "My Orders",
    subtitle: "Every order you have placed, with items and delivery details.",
  },
  wishlist: {
    title: "Wishlist",
    subtitle: "The flavors you have saved for later.",
  },
  addresses: {
    title: "Addresses",
    subtitle: "Manage where your orders get delivered.",
  },
  "skin-profile": {
    title: "Flavor Profile",
    subtitle: "Your taste preference, and snack ideas matched to it.",
  },
  settings: {
    title: "Account Settings",
    subtitle: "Update your personal details and password.",
  },
};

/* ── design tokens ────────────────────────────────────────────────────── */
const card = "rounded-2xl border border-cream bg-white";
const cardPad = "p-5 md:p-6";
const cardTitle = "text-[15px] font-semibold tracking-tight text-charcoal";
const cardLink =
  "inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-accent";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-cream bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal transition hover:border-accent hover:text-accent disabled:opacity-50";
const inputCls =
  "w-full rounded-xl border border-cream bg-white px-4 py-3 text-sm text-charcoal transition placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";
const labelCls = "mb-2 block text-[13px] font-medium text-charcoal";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function orderRef(no: number) {
  return `TM-${String(no).padStart(5, "0")}`;
}

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_PILL[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

/* Header row shared by every content card: title left, optional action right. */
function CardHead({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h3 className={cardTitle}>{title}</h3>
      {action}
    </div>
  );
}

/* KPI tile. `feature` paints the brand fill used on the lead tile. */
function StatTile({
  label,
  value,
  note,
  icon: Icon,
  feature = false,
  onClick,
}: {
  label: string;
  value: string;
  note: string;
  icon: IconType;
  feature?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        feature
          ? "border-transparent bg-beetroot text-white"
          : "border-cream bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            feature ? "bg-white/12 text-gold" : "bg-cream/70 text-accent"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        {onClick && (
          <button
            onClick={onClick}
            aria-label={`Open ${label}`}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
              feature
                ? "border-white/25 text-white hover:bg-white hover:text-beetroot"
                : "border-cream text-muted hover:border-accent hover:text-accent"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>
      <p
        className={`mt-4 text-[13px] font-medium ${
          feature ? "text-white/70" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-[28px] font-semibold leading-tight tracking-tight tabular-nums md:text-[32px]">
        {value}
      </p>
      <span
        className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
          feature ? "bg-white/12 text-white/80" : "bg-cream/70 text-muted"
        }`}
      >
        {note}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  compact = false,
}: {
  icon: IconType;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
}) {
  return (
    <div className={`text-center ${compact ? "py-8" : "py-14"}`}>
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream/70">
        <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
      </span>
      <h4 className="text-[15px] font-semibold tracking-tight">{title}</h4>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-6 text-muted">
        {body}
      </p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={`mt-6 ${btnPrimary}`}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* Delivery milestones. Horizontal on desktop, vertical on narrow screens so
   the stop labels never collide. */
function TrackRail({ status }: { status: OrderStatus }) {
  const current = ORDER_STATUS_STEP[status];
  const progress = Math.max(0, Math.min(3, current - 1)) / 3;
  return (
    <ol className="relative grid grid-cols-4">
      <span
        aria-hidden
        className="absolute left-[12.5%] right-[12.5%] top-[11px] h-1 rounded-full bg-cream"
      />
      <span
        aria-hidden
        className="absolute left-[12.5%] top-[11px] h-1 rounded-full bg-accent transition-[width] duration-1000 ease-out"
        style={{ width: `${progress * 75}%` }}
      />
      {TRACK_STEPS.map((step, i) => {
        const stepNo = i + 1;
        const done = stepNo < current;
        const active = stepNo === current;
        return (
          <li key={step} className="flex flex-col items-center text-center">
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition duration-500 ${
                done
                  ? "bg-accent text-white"
                  : active
                    ? "bg-accent text-white ring-4 ring-accent/15"
                    : "bg-white text-transparent ring-1 ring-cream"
              }`}
            >
              {done ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-white" : "bg-cream"
                  }`}
                />
              )}
            </span>
            <span
              className={`mt-2.5 text-[10px] font-semibold sm:text-[11px] ${
                active
                  ? "text-accent"
                  : done
                    ? "text-charcoal"
                    : "text-muted/60"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function DashboardPage() {
  const {
    user,
    setUser,
    wishlist,
    toggleWishlist,
    addToCart,
    logout,
    showToast,
    authLoading,
    formatPrice,
    localized,
  } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  /* Which order rows are expanded — each accordion toggles independently. */
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const toggleOrder = (id: string) =>
    setOpenOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* Switching sections from far down the page would otherwise land the reader
     mid-panel — pull them back to the shell, but only if they had scrolled. */
  const goToTab = (tab: TabKey) => {
    setActiveTab(tab);
    const el = shellRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 110;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  };

  const openOrderDetail = (id: string) => {
    setOpenOrders((prev) => new Set(prev).add(id));
    goToTab("orders");
  };

  const [addressDraft, setAddressDraft] = useState({
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [profileDraft, setProfileDraft] = useState({
    f_name: "",
    l_name: "",
    email: "",
    ph_no: "",
  });
  const [passwordDraft, setPasswordDraft] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const loggedIn = Boolean(user);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileDraft({
        f_name: user.firstName ?? "",
        l_name: user.lastName ?? "",
        email: user.email ?? "",
        ph_no: user.phone ?? "",
      });
    }
  }, [user]);

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    enabled: loggedIn,
    queryFn: async (): Promise<MyOrder[]> =>
      unwrap<MyOrder[]>(axios.get("/api/orders")),
  });

  const addressesQuery = useQuery({
    queryKey: ["my-addresses"],
    enabled: loggedIn,
    queryFn: async (): Promise<MyAddress[]> =>
      unwrap<MyAddress[]>(axios.get("/api/addresses")),
  });

  const recommendedQuery = useQuery({
    queryKey: ["products", "recommended"],
    queryFn: async (): Promise<ShopProduct | null> => {
      const data = await unwrap<{ products: ShopProduct[] }>(
        axios.get("/api/products?limit=1")
      );
      return data.products[0] ?? null;
    },
  });

  /* The wishlist stores slugs; resolve them against the catalog so the cards
     can show the real photo and price. */
  const catalogQuery = useQuery({
    queryKey: ["products", "catalog"],
    enabled: wishlist.length > 0,
    queryFn: async (): Promise<ShopProduct[]> => {
      const data = await unwrap<{ products: ShopProduct[] }>(
        axios.get("/api/products?limit=100")
      );
      return data.products;
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (values: typeof addressDraft) =>
      unwrap(axios.post("/api/addresses", values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      setAddressFormOpen(false);
      setAddressDraft({ line1: "", city: "", state: "", pincode: "" });
      showToast("New shipping address saved");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: number) =>
      unwrap(axios.patch(`/api/addresses/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      showToast("Default address updated");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) =>
      unwrap(axios.delete(`/api/addresses/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      showToast("Address removed");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const profileMutation = useMutation({
    mutationFn: async (values: typeof profileDraft) =>
      unwrap<{ name: string; email: string; phone: string }>(
        axios.patch("/api/me", values)
      ),
    onSuccess: (data: { name: string; email: string; phone: string }) => {
      const [firstName, ...rest] = data.name.split(" ");
      setUser({
        ...(user ?? { isLoggedIn: true }),
        isLoggedIn: true,
        firstName,
        lastName: rest.join(" "),
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast("Profile updated successfully");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const passwordMutation = useMutation({
    mutationFn: async (values: typeof passwordDraft) =>
      unwrap(axios.patch("/api/reset-password", values)),
    onSuccess: () => {
      setPasswordDraft({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      showToast("Password updated successfully");
    },
    onError: (error: Error) => showToast(error.message),
  });

  if (authLoading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-32">
        <p className="text-sm text-muted">
          {authLoading ? "Loading your account…" : "Redirecting to sign in…"}
        </p>
      </main>
    );
  }

  const activeUser = user;
  const orders = ordersQuery.data ?? [];
  const addresses = addressesQuery.data ?? [];
  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const trackedOrder = activeOrders[0] ?? null;
  const recommended = recommendedQuery.data;
  const recommendedVariant = recommended
    ? defaultVariant(recommended.productVariant)
    : null;
  const flavorTips = tipsForPreference(activeUser.skinType);
  const ordersPending = ordersQuery.isPending;
  const meta = TAB_META[activeTab];

  const tabCount = (tab: TabKey): number | null => {
    if (tab === "orders") return ordersPending ? null : orders.length;
    if (tab === "wishlist") return wishlist.length;
    if (tab === "addresses")
      return addressesQuery.isPending ? null : addresses.length;
    return null;
  };

  const panelCls = (tab: TabKey) =>
    activeTab === tab ? "dash-panel-in block" : "hidden";

  const handleClearWishlist = () => {
    wishlist.forEach((slug) => toggleWishlist(slug));
    showToast("Wishlist cleared");
  };

  /* Actions live in the content header, so they change with the section. */
  const headerActions = (
    <>
      {activeTab === "wishlist" && wishlist.length > 0 && (
        <button onClick={handleClearWishlist} className={btnGhost}>
          <X className="h-4 w-4" />
          Clear all
        </button>
      )}
      {activeTab === "addresses" && (
        <button
          onClick={() => setAddressFormOpen((v) => !v)}
          className={addressFormOpen ? btnGhost : btnPrimary}
        >
          {addressFormOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {addressFormOpen ? "Cancel" : "Add address"}
        </button>
      )}
      <Link href="/shop" className={btnPrimary}>
        <ShoppingBag className="h-4 w-4" />
        Shop now
      </Link>
    </>
  );

  return (
    <>
      <main className="flex-1 bg-ivory">
        {/* Brand band */}
        <section className="relative isolate overflow-hidden bg-beetroot text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block"
          >
            <img
              src="/images/processing/mango-drying.webp"
              alt=""
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #640C26 0%, rgba(100,12,38,0.96) 34%, rgba(100,12,38,0.76) 100%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-screen-2xl px-5 py-9 md:px-10 md:py-12">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2.5 text-xs text-white/55"
            >
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-white">
                My Account
              </span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  Thai Mango Circle
                </p>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Welcome back,{" "}
                  <span id="dash-greeting-name">
                    {activeUser.firstName || "Member"}
                  </span>
                </h1>
              </div>
              <p className="text-[13px] text-white/65">
                {activeUser.memberSince
                  ? `Member since ${activeUser.memberSince}`
                  : "Your Thai Mango account"}
              </p>
            </div>
          </div>
        </section>

        {/* App shell */}
        <div
          ref={shellRef}
          className="mx-auto max-w-screen-2xl px-4 py-6 md:px-10 md:py-10"
        >
          <div className="overflow-hidden rounded-3xl border border-cream bg-white shadow-[0_24px_60px_-45px_rgba(36,33,30,0.5)]">
            <div className="lg:grid lg:grid-cols-[248px_1fr] xl:grid-cols-[268px_1fr]">
              {/* Sidebar */}
              <aside className="hidden border-r border-cream bg-white p-5 lg:flex lg:flex-col">
                <div className="flex items-center gap-3 rounded-2xl bg-cream/50 p-3">
                  <span className="user-avatar-initial flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beetroot text-sm font-semibold text-gold">
                    {(activeUser.firstName || "M")[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="user-name-display truncate text-[13px] font-semibold text-charcoal">
                      {activeUser.name}
                    </p>
                    <p className="user-email-display truncate text-[11px] text-muted">
                      {activeUser.email}
                    </p>
                  </div>
                </div>

                <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/70">
                  Menu
                </p>
                <nav className="space-y-1" id="dashboard-nav-tabs">
                  {TABS.map((t) => {
                    const isActive = activeTab === t.key;
                    const count = tabCount(t.key);
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => goToTab(t.key)}
                        className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                          isActive
                            ? "bg-accent/8 font-semibold text-accent"
                            : "text-muted hover:bg-cream/50 hover:text-charcoal"
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                          />
                        )}
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-accent" : "text-muted"
                          }`}
                          strokeWidth={2}
                        />
                        <span className="truncate">{t.label}</span>
                        {count !== null && count > 0 && (
                          <span
                            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                              isActive
                                ? "bg-accent text-white"
                                : "bg-cream text-muted"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/70">
                  General
                </p>
                <button
                  id="logout-btn"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>Sign out</span>
                </button>

                <div className="mt-auto pt-7">
                  <div className="rounded-2xl bg-beetroot p-4 text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 text-gold">
                      <MessageCircle className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <p className="mt-3 text-[13px] font-semibold">
                      Need a hand?
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-white/65">
                      Questions about an order or a flavor — we are one message
                      away.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2 text-[12px] font-semibold text-charcoal transition hover:bg-white"
                    >
                      Talk to us
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Content */}
              <div className="bg-ivory/45 p-4 md:p-6 lg:p-7">
                {/* Section rail — the sidebar's stand-in on small screens */}
                <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:hidden">
                  {TABS.map((t) => {
                    const isActive = activeTab === t.key;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        onClick={() => goToTab(t.key)}
                        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold transition ${
                          isActive
                            ? "border-accent bg-accent text-white"
                            : "border-cream bg-white text-muted"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        {t.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => logout()}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-cream bg-white px-3 py-2 text-[12px] font-semibold text-rose-600"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                    Sign out
                  </button>
                </div>

                {/* Content header */}
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-tight md:text-[26px]">
                      {meta.title}
                    </h2>
                    <p className="mt-1 text-[13px] text-muted">
                      {meta.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {headerActions}
                  </div>
                </div>

                {/* ── OVERVIEW ─────────────────────────────────────────── */}
                <section
                  id="panel-overview"
                  role="tabpanel"
                  aria-label="Overview"
                  className={panelCls("overview")}
                >
                  {/* KPI row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatTile
                      feature
                      icon={Package}
                      label="Total Orders"
                      value={ordersPending ? "—" : String(orders.length)}
                      note={
                        ordersPending
                          ? "Loading"
                          : `${deliveredCount} delivered`
                      }
                      onClick={() => goToTab("orders")}
                    />
                    <StatTile
                      icon={Truck}
                      label="In Transit"
                      value={ordersPending ? "—" : String(activeOrders.length)}
                      note={
                        trackedOrder
                          ? ORDER_STATUS_LABEL[trackedOrder.status]
                          : "Nothing on the way"
                      }
                      onClick={() => goToTab("orders")}
                    />
                    <StatTile
                      icon={Wallet}
                      label="Total Spent"
                      value={ordersPending ? "—" : formatPrice(totalSpent)}
                      note={`Across ${orders.length} order${
                        orders.length === 1 ? "" : "s"
                      }`}
                    />
                    <StatTile
                      icon={Heart}
                      label="Saved Flavors"
                      value={String(wishlist.length)}
                      note="Ready to reorder"
                      onClick={() => goToTab("wishlist")}
                    />
                  </div>

                  {/* Tracking + recent orders */}
                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <div className={`${card} ${cardPad} xl:col-span-7`}>
                      <CardHead
                        title="Order Tracking"
                        action={
                          trackedOrder ? (
                            <button
                              onClick={() => openOrderDetail(trackedOrder.id)}
                              className={cardLink}
                            >
                              View details
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          ) : undefined
                        }
                      />

                      {ordersPending ? (
                        <p className="py-10 text-center text-sm text-muted">
                          Loading your orders…
                        </p>
                      ) : trackedOrder ? (
                        <>
                          <div className="flex items-center gap-4 rounded-2xl bg-ivory/70 p-4">
                            <img
                              src={productImage(
                                trackedOrder.items[0]?.product?.images
                              )}
                              alt=""
                              aria-hidden
                              className="h-16 w-16 shrink-0 rounded-xl bg-white object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-lg font-semibold tracking-tight tabular-nums">
                                  {orderRef(trackedOrder.order_no)}
                                </span>
                                <StatusPill status={trackedOrder.status} />
                              </div>
                              <p className="mt-1.5 truncate text-[13px] text-muted">
                                {trackedOrder.items.length} item
                                {trackedOrder.items.length === 1 ? "" : "s"} ·{" "}
                                <span className="font-semibold text-charcoal tabular-nums">
                                  {formatPrice(Number(trackedOrder.total))}
                                </span>{" "}
                                · Placed {formatDate(trackedOrder.created_at)}
                              </p>
                              <p className="mt-0.5 truncate text-[12px] text-muted">
                                To {trackedOrder.ship_city},{" "}
                                {trackedOrder.ship_state} —{" "}
                                {trackedOrder.ship_pincode}
                              </p>
                            </div>
                          </div>

                          <div className="mt-7 px-1">
                            <TrackRail status={trackedOrder.status} />
                          </div>
                        </>
                      ) : (
                        <EmptyState
                          icon={Truck}
                          title="Nothing in transit"
                          body={
                            orders.length > 0
                              ? "Every order you have placed has arrived."
                              : "Your first pouch of sun-dried mango is waiting in the shop."
                          }
                          ctaLabel="Browse the shop"
                          ctaHref="/shop"
                        />
                      )}
                    </div>

                    <div className={`${card} ${cardPad} xl:col-span-5`}>
                      <CardHead
                        title="Recent Orders"
                        action={
                          orders.length > 0 ? (
                            <button
                              onClick={() => goToTab("orders")}
                              className={cardLink}
                            >
                              See all
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          ) : undefined
                        }
                      />
                      {ordersPending ? (
                        <p className="py-10 text-center text-sm text-muted">
                          Loading…
                        </p>
                      ) : orders.length === 0 ? (
                        <EmptyState
                          compact
                          icon={Package}
                          title="No orders yet"
                          body="Your order history will show up here."
                        />
                      ) : (
                        <ul className="space-y-1">
                          {orders.slice(0, 4).map((o) => (
                            <li key={o.id}>
                              <button
                                onClick={() => openOrderDetail(o.id)}
                                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-ivory"
                              >
                                <img
                                  src={productImage(
                                    o.items[0]?.product?.images
                                  )}
                                  alt=""
                                  aria-hidden
                                  className="h-10 w-10 shrink-0 rounded-lg bg-cream object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-semibold tabular-nums">
                                    {orderRef(o.order_no)}
                                  </p>
                                  <p className="mt-0.5 truncate text-[11px] text-muted">
                                    {formatDate(o.created_at)} ·{" "}
                                    <span className="tabular-nums">
                                      {formatPrice(Number(o.total))}
                                    </span>
                                  </p>
                                </div>
                                <StatusPill status={o.status} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Recommendation + flavor profile */}
                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                    {recommended && recommendedVariant && (
                      <div className={`${card} ${cardPad} xl:col-span-8`}>
                        <CardHead
                          title="Chosen For You"
                          action={
                            <Link
                              href={`/product-detail/${recommended.slug}`}
                              className={cardLink}
                            >
                              View product
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          }
                        />
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                          <div className="group relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-cream sm:h-36 sm:w-36">
                            <img
                              src={productImage(recommended.images)}
                              alt={localized(
                                recommended.name_en,
                                recommended.name_th
                              )}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                              Fresh from the orchard
                            </p>
                            <h4 className="mt-1.5 text-xl font-semibold tracking-tight">
                              {localized(
                                recommended.name_en,
                                recommended.name_th
                              )}
                            </h4>
                            <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted">
                              {localized(
                                recommended.description_en,
                                recommended.description_th
                              )}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <span className="text-xl font-semibold tabular-nums tracking-tight">
                                {formatPrice(Number(recommendedVariant.price))}
                              </span>
                              <span className="rounded-full bg-cream/70 px-2.5 py-1 text-[11px] font-medium text-muted">
                                {recommendedVariant.label}
                              </span>
                              <button
                                onClick={() =>
                                  addToCart({
                                    slug: recommended.slug,
                                    name: localized(
                                      recommended.name_en,
                                      recommended.name_th
                                    ),
                                    price: Number(recommendedVariant.price),
                                    image: productImage(recommended.images),
                                    size: recommendedVariant.label,
                                  })
                                }
                                className={`add-to-cart ml-auto ${btnPrimary}`}
                              >
                                <ShoppingBag className="h-4 w-4" />
                                Add to bag
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className={`rounded-2xl bg-beetroot p-5 text-white md:p-6 ${
                        recommended && recommendedVariant
                          ? "xl:col-span-4"
                          : "xl:col-span-12"
                      }`}
                    >
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <h3 className="text-[15px] font-semibold tracking-tight">
                          Flavor Profile
                        </h3>
                        <button
                          onClick={() => goToTab("skin-profile")}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gold transition hover:text-white"
                        >
                          Open
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-gold">
                        <Citrus className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <p className="mt-4 text-[13px] text-white/60">
                        Your preference
                      </p>
                      <p className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-gold">
                        {activeUser.skinType || "Not set"}
                      </p>
                      <p className="mt-3 text-[12px] leading-5 text-white/60">
                        {activeUser.skinType
                          ? "Snack ideas matched to this preference are waiting in your profile."
                          : "Set at registration — it shapes the picks we suggest."}
                      </p>
                    </div>
                  </div>
                </section>

                {/* ── ORDERS ───────────────────────────────────────────── */}
                <section
                  id="panel-orders"
                  role="tabpanel"
                  aria-label="Orders"
                  className={panelCls("orders")}
                >
                  <div className={card}>
                    {ordersPending ? (
                      <p className="py-16 text-center text-sm text-muted">
                        Loading your orders…
                      </p>
                    ) : orders.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title="No orders yet"
                        body="Explore our sun-dried mango flavors and your first order will appear here."
                        ctaLabel="Discover the shop"
                        ctaHref="/shop"
                      />
                    ) : (
                      <div className="divide-y divide-cream">
                        {orders.map((o) => {
                          const isOpen = openOrders.has(o.id);
                          return (
                            <div key={o.id}>
                              <button
                                type="button"
                                onClick={() => toggleOrder(o.id)}
                                aria-expanded={isOpen}
                                className={`flex w-full items-center gap-4 p-4 text-left transition md:p-5 ${
                                  isOpen ? "bg-ivory/60" : "hover:bg-ivory/50"
                                }`}
                              >
                                <img
                                  src={productImage(
                                    o.items[0]?.product?.images
                                  )}
                                  alt=""
                                  aria-hidden
                                  className="hidden h-12 w-12 shrink-0 rounded-xl bg-cream object-cover sm:block"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="text-[15px] font-semibold tracking-tight tabular-nums">
                                      {orderRef(o.order_no)}
                                    </span>
                                    <StatusPill status={o.status} />
                                  </div>
                                  <p className="mt-1 text-[12px] text-muted">
                                    {formatDate(o.created_at)} ·{" "}
                                    {o.items.length} item
                                    {o.items.length === 1 ? "" : "s"} ·{" "}
                                    {o.payment === "COD"
                                      ? "Cash on delivery"
                                      : "Prepaid"}
                                  </p>
                                </div>
                                <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                                  {formatPrice(Number(o.total))}
                                </span>
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                                    isOpen
                                      ? "border-accent bg-accent text-white"
                                      : "border-cream text-muted"
                                  }`}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform duration-300 ${
                                      isOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </span>
                              </button>

                              <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                              >
                                <div className="min-h-0 overflow-hidden">
                                  <div className="border-t border-cream bg-ivory/40 p-4 md:p-5">
                                    <ul className="space-y-2">
                                      {o.items.map((item) => (
                                        <li
                                          key={item.id}
                                          className="flex items-center gap-4 rounded-xl bg-white p-3"
                                        >
                                          <img
                                            src={productImage(
                                              item.product?.images
                                            )}
                                            alt={item.name}
                                            className="h-12 w-12 shrink-0 rounded-lg bg-cream object-cover"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] font-semibold">
                                              {item.name}
                                            </p>
                                            <p className="mt-0.5 text-[12px] text-muted">
                                              {item.variant_label
                                                ? `${item.variant_label} · `
                                                : ""}
                                              Qty {item.quantity} ·{" "}
                                              <span className="tabular-nums">
                                                {formatPrice(
                                                  Number(item.price)
                                                )}
                                              </span>
                                            </p>
                                          </div>
                                          <button
                                            onClick={() =>
                                              addToCart({
                                                slug: item.product?.slug,
                                                name: item.name,
                                                price: Number(item.price),
                                                image: productImage(
                                                  item.product?.images
                                                ),
                                              })
                                            }
                                            className={`add-to-cart shrink-0 ${btnGhost}`}
                                          >
                                            Reorder
                                          </button>
                                        </li>
                                      ))}
                                    </ul>

                                    <div className="mt-4 grid gap-4 rounded-xl bg-white p-4 sm:grid-cols-2">
                                      <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                                          Delivered to
                                        </p>
                                        <p className="mt-1.5 text-[13px] leading-6 text-muted">
                                          <span className="font-semibold text-charcoal">
                                            {o.ship_name}
                                          </span>
                                          <br />
                                          {o.ship_line1}
                                          <br />
                                          {o.ship_city}, {o.ship_state} —{" "}
                                          {o.ship_pincode}
                                        </p>
                                      </div>
                                      <div className="sm:text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                                          Order total
                                        </p>
                                        <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
                                          {formatPrice(Number(o.total))}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* ── WISHLIST ─────────────────────────────────────────── */}
                <section
                  id="panel-wishlist"
                  role="tabpanel"
                  aria-label="Wishlist"
                  className={panelCls("wishlist")}
                >
                  {wishlist.length === 0 ? (
                    <div className={card}>
                      <EmptyState
                        icon={Heart}
                        title="Your wishlist is empty"
                        body="Tap the heart on any product and it will be waiting for you here."
                        ctaLabel="Discover the shop"
                        ctaHref="/shop"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {wishlist.map((slug) => {
                        const product = catalogQuery.data?.find(
                          (p) => p.slug === slug
                        );
                        const variant = product
                          ? defaultVariant(product.productVariant)
                          : null;
                        return (
                          <article key={slug} className={`${card} group p-3`}>
                            <div className="relative aspect-square overflow-hidden rounded-xl bg-cream">
                              {product ? (
                                <img
                                  src={productImage(product.images)}
                                  alt={localized(
                                    product.name_en,
                                    product.name_th
                                  )}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center">
                                  <Heart
                                    className="h-8 w-8 text-accent/25"
                                    strokeWidth={1.5}
                                  />
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  toggleWishlist(
                                    slug,
                                    product
                                      ? localized(
                                          product.name_en,
                                          product.name_th
                                        )
                                      : undefined
                                  )
                                }
                                title="Remove from wishlist"
                                aria-label="Remove from wishlist"
                                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition hover:bg-rose-600 hover:text-white"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="p-2.5">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                                {product?.category
                                  ? localized(
                                      product.category.name_en,
                                      product.category.name_th
                                    )
                                  : "Thai Mango"}
                              </p>
                              <h4 className="mt-1.5 truncate text-[14px] font-semibold tracking-tight">
                                {product
                                  ? localized(product.name_en, product.name_th)
                                  : catalogQuery.isPending
                                    ? "Loading…"
                                    : slug}
                              </h4>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-[15px] font-semibold tabular-nums tracking-tight">
                                  {variant
                                    ? formatPrice(Number(variant.price))
                                    : "—"}
                                </span>
                                <Link
                                  href={
                                    product
                                      ? `/product-detail/${slug}`
                                      : "/shop"
                                  }
                                  className={btnGhost}
                                >
                                  View
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* ── ADDRESSES ────────────────────────────────────────── */}
                <section
                  id="panel-addresses"
                  role="tabpanel"
                  aria-label="Address book"
                  className={panelCls("addresses")}
                >
                  {addressFormOpen && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addAddressMutation.mutate(addressDraft);
                      }}
                      className={`${card} ${cardPad} mb-4`}
                    >
                      <CardHead title="New address" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Address line</label>
                          <input
                            className={inputCls}
                            required
                            placeholder="Flat / house no, street, area"
                            value={addressDraft.line1}
                            onChange={(e) =>
                              setAddressDraft((d) => ({
                                ...d,
                                line1: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className={labelCls}>City</label>
                          <input
                            className={inputCls}
                            required
                            placeholder="Mumbai"
                            value={addressDraft.city}
                            onChange={(e) =>
                              setAddressDraft((d) => ({
                                ...d,
                                city: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className={labelCls}>State</label>
                          <input
                            className={inputCls}
                            required
                            placeholder="Maharashtra"
                            value={addressDraft.state}
                            onChange={(e) =>
                              setAddressDraft((d) => ({
                                ...d,
                                state: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Pincode</label>
                          <input
                            className={inputCls}
                            required
                            placeholder="400050"
                            value={addressDraft.pincode}
                            onChange={(e) =>
                              setAddressDraft((d) => ({
                                ...d,
                                pincode: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={addAddressMutation.isPending}
                        className={`mt-5 ${btnPrimary}`}
                      >
                        {addAddressMutation.isPending
                          ? "Saving…"
                          : "Save address"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  )}

                  {addressesQuery.isPending ? (
                    <div className={card}>
                      <p className="py-16 text-center text-sm text-muted">
                        Loading addresses…
                      </p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className={card}>
                      <EmptyState
                        icon={MapPin}
                        title="No saved addresses yet"
                        body="Add a shipping address and checkout becomes a single step."
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`${card} ${cardPad} flex flex-col ${
                            addr.is_default ? "ring-1 ring-accent/25" : ""
                          }`}
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream/70 text-accent">
                              <MapPin className="h-4 w-4" strokeWidth={2} />
                            </span>
                            {addr.is_default && (
                              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] font-semibold tracking-tight">
                            {activeUser.name}
                          </p>
                          <p className="mt-1.5 text-[13px] leading-6 text-muted">
                            {addr.line1}
                            <br />
                            {addr.city}, {addr.state} — {addr.pincode}
                            {activeUser.phone && (
                              <>
                                <br />
                                {activeUser.phone}
                              </>
                            )}
                          </p>
                          <div className="mt-5 flex items-center gap-2 border-t border-cream pt-4">
                            {!addr.is_default && (
                              <button
                                onClick={() =>
                                  setDefaultAddressMutation.mutate(addr.id)
                                }
                                disabled={setDefaultAddressMutation.isPending}
                                className={btnGhost}
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm("Delete this address?")) {
                                  deleteAddressMutation.mutate(addr.id);
                                }
                              }}
                              disabled={deleteAddressMutation.isPending}
                              className="ml-auto rounded-xl px-3 py-2.5 text-[13px] font-semibold text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* ── FLAVOR PROFILE ───────────────────────────────────── */}
                <section
                  id="panel-skin-profile"
                  role="tabpanel"
                  aria-label="Flavor profile"
                  className={panelCls("skin-profile")}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-beetroot p-5 text-white md:p-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-gold">
                        <Citrus className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <p className="mt-4 text-[13px] text-white/60">
                        Flavor preference
                      </p>
                      <p className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-gold md:text-[32px]">
                        {activeUser.skinType || "Not set"}
                      </p>
                      {!activeUser.skinType && (
                        <p className="mt-3 text-[12px] leading-5 text-white/60">
                          Chosen during registration — it drives your
                          personalized picks.
                        </p>
                      )}
                    </div>
                    <div className={`${card} ${cardPad}`}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream/70 text-accent">
                        <Package className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <p className="mt-4 text-[13px] text-muted">
                        Member since
                      </p>
                      <p className="mt-1 text-[28px] font-semibold leading-tight tracking-tight tabular-nums md:text-[32px]">
                        {activeUser.memberSince || "—"}
                      </p>
                      <p className="mt-3 text-[12px] leading-5 text-muted">
                        {orders.length} order{orders.length === 1 ? "" : "s"}{" "}
                        placed with Thai Mango so far.
                      </p>
                    </div>
                  </div>

                  {/* Suggestions follow the shopper's saved flavor preference —
                      an unset preference gets a prompt, not a generic list. */}
                  {flavorTips ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {[
                        {
                          key: "morning",
                          kicker: "Morning",
                          title: "Rise & snack",
                          tips: flavorTips.morning,
                        },
                        {
                          key: "evening",
                          kicker: "Evening",
                          title: "Wind down & snack",
                          tips: flavorTips.evening,
                        },
                      ].map((block) => (
                        <div key={block.key} className={`${card} ${cardPad}`}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                            {block.kicker} ideas for {activeUser.skinType}
                          </p>
                          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
                            {block.title}
                          </h3>
                          <ol className="mt-5 space-y-3">
                            {block.tips.map((tip, i) => (
                              <li
                                key={tip.title}
                                className="flex gap-3.5 rounded-xl bg-ivory/60 p-3.5"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-semibold tabular-nums text-accent">
                                  {i + 1}
                                </span>
                                <div>
                                  <p className="text-[13px] font-semibold">
                                    {tip.title}
                                  </p>
                                  <p className="mt-1 text-[12px] leading-6 text-muted">
                                    {tip.body}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`${card} mt-4`}>
                      <EmptyState
                        icon={Citrus}
                        title="No flavor preference saved yet"
                        body="Your preference is chosen at registration. Once it is set, snack suggestions matched to it appear here."
                      />
                    </div>
                  )}
                </section>

                {/* ── SETTINGS ─────────────────────────────────────────── */}
                <section
                  id="panel-settings"
                  role="tabpanel"
                  aria-label="Account settings"
                  className={panelCls("settings")}
                >
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <form
                      className={`${card} ${cardPad}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        profileMutation.mutate(profileDraft);
                      }}
                    >
                      <CardHead title="Profile" />
                      <p className="-mt-3 mb-5 text-[13px] text-muted">
                        How we address you, and where order updates are sent.
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>First name</label>
                          <input
                            type="text"
                            required
                            value={profileDraft.f_name}
                            onChange={(e) =>
                              setProfileDraft((d) => ({
                                ...d,
                                f_name: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Last name</label>
                          <input
                            type="text"
                            required
                            value={profileDraft.l_name}
                            onChange={(e) =>
                              setProfileDraft((d) => ({
                                ...d,
                                l_name: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Email address</label>
                          <input
                            type="email"
                            required
                            value={profileDraft.email}
                            onChange={(e) =>
                              setProfileDraft((d) => ({
                                ...d,
                                email: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Phone number</label>
                          <PhoneField
                            required
                            value={profileDraft.ph_no}
                            onChange={(v) =>
                              setProfileDraft((d) => ({ ...d, ph_no: v }))
                            }
                            inputClassName={inputCls}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={profileMutation.isPending}
                        className={`mt-6 ${btnPrimary}`}
                      >
                        {profileMutation.isPending
                          ? "Saving…"
                          : "Save changes"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>

                    <form
                      className={`${card} ${cardPad}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          passwordDraft.new_password !==
                          passwordDraft.confirm_password
                        ) {
                          showToast("New passwords do not match");
                          return;
                        }
                        passwordMutation.mutate(passwordDraft);
                      }}
                    >
                      <CardHead title="Security" />
                      <p className="-mt-3 mb-5 text-[13px] text-muted">
                        Minimum 8 characters. You stay signed in after the
                        change.
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Current password</label>
                          <PasswordInput
                            required
                            autoComplete="current-password"
                            value={passwordDraft.old_password}
                            onChange={(e) =>
                              setPasswordDraft((d) => ({
                                ...d,
                                old_password: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>New password</label>
                          <PasswordInput
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={passwordDraft.new_password}
                            onChange={(e) =>
                              setPasswordDraft((d) => ({
                                ...d,
                                new_password: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Confirm password</label>
                          <PasswordInput
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={passwordDraft.confirm_password}
                            onChange={(e) =>
                              setPasswordDraft((d) => ({
                                ...d,
                                confirm_password: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={passwordMutation.isPending}
                        className={`mt-6 ${btnPrimary}`}
                      >
                        {passwordMutation.isPending
                          ? "Updating…"
                          : "Update password"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CtaBanner
        eyebrow="Welcome Back"
        title="Restock your favorites"
        description="Your last order's a click away — or discover a flavor you haven't tried yet."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="Talk to Us"
        secondaryHref="/contact"
      />
    </>
  );
}
