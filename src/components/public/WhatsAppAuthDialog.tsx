"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, X } from "lucide-react";
import PhoneField from "@/components/common/PhoneField";
import { useStore } from "@/components/public/store";
import { WhatsAppIcon } from "@/components/public/BrandIcons";
import { unwrap } from "@/lib/http";
import { toAuthUser, type ApiUser } from "@/lib/authUser";
import { readReturnTo } from "@/lib/returnTo";
import {
  whatsappProfileSchema,
  whatsappSendSchema,
} from "@/schemas/whatsapp.schema";

type Step = "phone" | "code" | "profile";

interface WhatsAppAuthDialogProps {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1";
const submitCls =
  "w-full py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed";

const SUBTITLES: Record<Step, string> = {
  phone: "We'll send a 6-digit code to your WhatsApp.",
  code: "Enter the code we just sent you on WhatsApp.",
  profile: "New here? Tell us your name to finish creating your account.",
};

/**
 * "Continue with WhatsApp": number → one-time code → (first time only) name.
 * Bottom sheet on phones, centred dialog from `sm` up — same shell as ReviewDialog.
 */
export default function WhatsAppAuthDialog(props: WhatsAppAuthDialogProps) {
  /* Remount per opening so every attempt starts at the number step. */
  if (!props.open) return null;
  return <WhatsAppAuthBody {...props} />;
}

function WhatsAppAuthBody({ onClose }: WhatsAppAuthDialogProps) {
  const router = useRouter();
  const { setUser, showToast } = useStore();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState({ f_name: "", l_name: "", email: "" });
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");

  /* Esc closes; the page behind doesn't scroll while the sheet is up. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const sendCode = useMutation({
    mutationFn: async () =>
      unwrap<{ resend_in: number }>(axios.post("/api/auth/whatsapp/send", { phone })),
    onSuccess: (data) => {
      setError("");
      setCode("");
      setStep("code");
      setResendIn(data.resend_in);
    },
    onError: (err: Error) => setError(err.message),
  });

  const verify = useMutation({
    mutationFn: async (withProfile: boolean) =>
      unwrap<ApiUser | { needs_profile: true }>(
        axios.post("/api/auth/whatsapp/verify", {
          phone,
          code,
          ...(withProfile ? { profile } : {}),
        })
      ),
    onSuccess: (data) => {
      setError("");
      if ("needs_profile" in data) {
        setStep("profile");
        return;
      }
      const authUser = toAuthUser(data);
      setUser(authUser);
      showToast(`Welcome, ${authUser.firstName}!`);
      /* Back to where they came from, else their dashboard. */
      const next = readReturnTo();
      onClose();
      setTimeout(() => router.replace(next ?? "/dashboard"), 600);
    },
    onError: (err: Error) => setError(err.message),
  });

  const onSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = whatsappSendSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid number");
      return;
    }
    sendCode.mutate();
  };

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code");
      return;
    }
    verify.mutate(false);
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = whatsappProfileSchema.safeParse(profile);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    verify.mutate(true);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-dialog-title"
        className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl md:p-7"
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10">
            <WhatsAppIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="whatsapp-dialog-title" className="text-base font-semibold text-charcoal">
              Continue with WhatsApp
            </h2>
            <p className="text-xs text-muted">{SUBTITLES[step]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-cream/60 hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "phone" && (
          <form className="space-y-4" onSubmit={onSendCode}>
            <div>
              <label htmlFor="wa-phone" className={labelCls}>
                WhatsApp Number
              </label>
              <PhoneField
                id="wa-phone"
                value={phone}
                onChange={(v) => {
                  setPhone(v);
                  setError("");
                }}
                inputClassName={inputCls}
              />
            </div>
            {error && <p className="text-[11px] text-rose-600">{error}</p>}
            <button type="submit" disabled={sendCode.isPending} className={submitCls}>
              <span>{sendCode.isPending ? "Sending Code..." : "Send Code"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {step === "code" && (
          <form className="space-y-4" onSubmit={onVerify}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="wa-code"
                  className="block text-[11px] uppercase tracking-wider font-semibold text-muted"
                >
                  Code sent to {phone}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError("");
                  }}
                  className="text-[11px] text-muted hover:text-accent transition"
                >
                  Change number
                </button>
              </div>
              <input
                id="wa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                className={inputCls + " text-center text-lg tracking-[0.5em] font-semibold"}
              />
            </div>
            {error && <p className="text-[11px] text-rose-600">{error}</p>}
            <button type="submit" disabled={verify.isPending} className={submitCls}>
              <span>{verify.isPending ? "Checking..." : "Verify & Continue"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-xs text-muted">
              Didn&apos;t get it?{" "}
              {resendIn > 0 ? (
                <span>Resend in {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  disabled={sendCode.isPending}
                  onClick={() => sendCode.mutate()}
                  className="text-accent font-semibold underline hover:text-charcoal transition"
                >
                  Resend code
                </button>
              )}
            </p>
          </form>
        )}

        {step === "profile" && (
          <form className="space-y-4" onSubmit={onCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wa-fname" className={labelCls}>
                  First Name
                </label>
                <input
                  id="wa-fname"
                  type="text"
                  autoFocus
                  placeholder="Aarav"
                  value={profile.f_name}
                  onChange={(e) => setProfile((p) => ({ ...p, f_name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="wa-lname" className={labelCls}>
                  Last Name
                </label>
                <input
                  id="wa-lname"
                  type="text"
                  placeholder="Sharma"
                  value={profile.l_name}
                  onChange={(e) => setProfile((p) => ({ ...p, l_name: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="wa-email" className={labelCls}>
                Email Address <span className="normal-case tracking-normal font-normal">(optional, for order receipts)</span>
              </label>
              <input
                id="wa-email"
                type="email"
                placeholder="aarav@example.com"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className={inputCls}
              />
            </div>
            {error && <p className="text-[11px] text-rose-600">{error}</p>}
            <button type="submit" disabled={verify.isPending} className={submitCls}>
              <span>{verify.isPending ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
