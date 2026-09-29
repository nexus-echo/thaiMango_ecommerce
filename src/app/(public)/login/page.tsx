"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useStore } from "@/components/public/store";
import { loginSchema } from "@/schemas/login.schema";
import { unwrap } from "@/lib/http";
import CtaBanner from "@/components/public/CtaBanner";
import AuthBrandPanel from "@/components/public/AuthBrandPanel";
import DoodleBackdrop from "@/components/public/DoodleBackdrop";
import SocialAuthButtons from "@/components/public/SocialAuthButtons";
import { toAuthUser, type ApiUser } from "@/lib/authUser";
import { readReturnTo, useReturnTo, withReturnTo } from "@/lib/returnTo";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast } = useStore();
  const returnTo = useReturnTo();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) =>
      unwrap<ApiUser>(axios.post("/api/login", values)),
    onSuccess: (data) => {
      const authUser = toAuthUser(data);
      setUser(authUser);
      showToast(`Welcome back, ${authUser.firstName}!`);
      /* Back to where they came from (e.g. the review they were writing),
         else their dashboard. replace() so Back doesn't land on this form. */
      const next = readReturnTo();
      setTimeout(() => {
        router.replace(next ?? (data.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"));
      }, 600);
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const onSubmit = (values: LoginValues) => loginMutation.mutate(values);

  return (
    <>
    <main className="relative overflow-hidden flex-1 flex items-center justify-center py-12 md:py-20 px-4 sm:px-6">
      <DoodleBackdrop src="/images/doodles/mango.svg" tile={440} className="text-accent opacity-[0.14]" />
      <div className="relative max-w-5xl w-full bg-white rounded-[36px] shadow-2xl border border-cream overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual / Brand Column (5 cols) */}
        <AuthBrandPanel
          eyebrow="Thai Bangkok Circle"
          title="Welcome Back, Mango Lover"
          description="Access your favorite dried mango flavors, order history, loyalty rewards, and personalized snack recommendations."
        >
          {/* Member Perks */}
          <div className="pt-8 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>15% Member Discount on all reorders</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>Free Express Delivery, Freshness Sealed</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>Complimentary Festive Gift Box Sampler</span>
            </div>
          </div>
        </AuthBrandPanel>

        {/* Right Sign In Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-2">
              Account Login
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal mb-2">
              Sign In to Bangkok Mango
            </h1>
            <p className="text-xs text-muted">
              Don&apos;t have an account yet?{" "}
              <Link
                href={withReturnTo("/register", returnTo)}
                className="text-accent font-semibold underline hover:text-charcoal transition"
              >
                Create an Account
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form id="login-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="login-email"
                  placeholder="aarav@example.com"
                  {...register("email")}
                  className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-muted absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  id="forgot-password-link"
                  className="text-[11px] text-muted hover:text-accent transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="p-1 text-muted hover:text-charcoal absolute right-3.5 top-1/2 -translate-y-1/2"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  defaultChecked
                  className="w-4 h-4 rounded border-cream text-accent focus:ring-accent accent-accent"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              id="submit-login"
              disabled={loginMutation.isPending}
              className="w-full py-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loginMutation.isPending ? "Signing In..." : "Sign In to Bangkok Mango"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream"></div>
            </div>
            <span className="relative bg-white px-4 text-xs text-muted font-medium uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Social Logins */}
          <SocialAuthButtons mode="login" />
        </div>
      </div>
    </main>
      <CtaBanner
        eyebrow="New Here"
        title="Taste before you sign in"
        description="Browse every sun-dried mango flavor — no account needed to explore the range."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="Create an Account"
        secondaryHref="/register"
      />
    </>
  );
}
