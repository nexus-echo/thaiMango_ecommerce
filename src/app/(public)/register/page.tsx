"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneField from "@/components/common/PhoneField";
import PasswordInput from "@/components/common/PasswordInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useStore } from "@/components/public/store";
import { signUpSchema } from "@/schemas/signup.schema";
import { unwrap } from "@/lib/http";
import CtaBanner from "@/components/public/CtaBanner";
import AuthBrandPanel from "@/components/public/AuthBrandPanel";
import DoodleBackdrop from "@/components/public/DoodleBackdrop";
import SocialAuthButtons from "@/components/public/SocialAuthButtons";
import { readReturnTo, useReturnTo, withReturnTo } from "@/lib/returnTo";

type SignUpValues = z.infer<typeof signUpSchema>;

const SKIN_TYPES = ["Classic", "Spicy", "Sweet & Glazed", "Fusion"] as const;
const SKIN_TYPE_TITLES: Record<(typeof SKIN_TYPES)[number], string> = {
  Classic: "Plain & natural",
  Spicy: "Chili & lime lover",
  "Sweet & Glazed": "Honey glazed fan",
  Fusion: "Adventurous, beetroot & fusion blends",
};

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, showToast } = useStore();
  const returnTo = useReturnTo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { choice: "Classic" },
  });
  const selectedSkinType = watch("choice");

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpValues) =>
      unwrap<{ id: string; name: string; email: string; phone: string }>(
        axios.post("/api/sign-up", values)
      ),
    onSuccess: (data, values) => {
      setUser({
        isLoggedIn: true,
        id: data.id,
        firstName: values.f_name,
        lastName: values.l_name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        skinType: values.choice,
      });
      showToast("Welcome to the Bangkok Mango Circle! Claimed 15% discount.");
      /* Back to where they came from (e.g. the review they were writing),
         else their dashboard. replace() so Back doesn't land on this form. */
      const next = readReturnTo();
      setTimeout(() => {
        router.replace(next ?? "/dashboard");
      }, 600);
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const onSubmit = (values: SignUpValues) => signUpMutation.mutate(values);

  return (
    <>
    <main className="relative overflow-hidden flex-1 flex items-center justify-center py-12 md:py-20 px-4 sm:px-6">
      <DoodleBackdrop src="/images/doodles/mango.svg" tile={440} className="text-accent opacity-[0.14]" />
      <div className="relative max-w-5xl w-full bg-white rounded-[36px] shadow-2xl border border-cream overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual / Brand Column (5 cols) */}
        <AuthBrandPanel
          eyebrow="Join The Bangkok Mango Circle"
          title="Begin Your Mango Snacking Journey"
          description="Unlock instant member privileges, tailored flavor recommendations, birthday gifts, and dedicated concierge support."
        >
          {/* Welcome Privilege Banner */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1">
              New Member Gift
            </span>
            <p className="text-xs font-semibold text-white">
              Receive a 15% Welcome Voucher &amp; 100 Reward Points upon
              registration.
            </p>
          </div>
        </AuthBrandPanel>

        {/* Right Register Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
              New Membership
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal mb-2">
              Create Account
            </h1>
            <p className="text-xs text-muted">
              Already registered?{" "}
              <Link
                href={withReturnTo("/login", returnTo)}
                className="text-accent font-semibold underline hover:text-charcoal transition"
              >
                Sign In here
              </Link>
            </p>
          </div>

          {/* Register Form */}
          <form id="register-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="reg-firstname"
                  placeholder="Aarav"
                  {...register("f_name")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.f_name && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.f_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="reg-lastname"
                  placeholder="Sharma"
                  {...register("l_name")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.l_name && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.l_name.message}</p>
                )}
              </div>
            </div>

            {/* Stacked again at lg: the form is only 7/12 of the card there,
                too narrow for the country picker + number side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="reg-email"
                  placeholder="aarav@example.com"
                  {...register("email")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Phone Number
                </label>
                <Controller
                  name="ph_no"
                  control={control}
                  render={({ field }) => (
                    <PhoneField
                      id="reg-phone"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputClassName="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                    />
                  )}
                />
                {errors.ph_no && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.ph_no.message}</p>
                )}
              </div>
            </div>

            {/* Flavor Preference Customization Selector */}
            <div className="pt-2">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-charcoal mb-2">
                Select Your Flavor Preference (For Personalized Picks)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="skin-type-selector">
                {SKIN_TYPES.map((type) => {
                  const active = selectedSkinType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      className={
                        active
                          ? "skin-type-btn py-2 px-2 rounded-xl border border-charcoal bg-charcoal text-white text-xs font-semibold text-center"
                          : "skin-type-btn py-2 px-2 rounded-xl border border-cream bg-ivory/50 text-xs font-semibold text-muted hover:border-accent transition text-center"
                      }
                      data-type={type}
                      title={SKIN_TYPE_TITLES[type]}
                      onClick={() => setValue("choice", type)}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Password
                </label>
                <PasswordInput
                  id="reg-password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Confirm Password
                </label>
                <PasswordInput
                  id="reg-confirm-password"
                  placeholder="Re-enter password"
                  {...register("confirm_password")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.confirm_password && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  id="reg-terms"
                  defaultChecked
                  className="w-4 h-4 mt-0.5 rounded border-cream text-accent focus:ring-accent accent-accent"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-accent underline">
                    Privacy Policy
                  </Link>{" "}
                  and wish to receive tasty mango snack updates.
                </span>
              </label>
            </div>

            <button
              type="submit"
              id="submit-register"
              disabled={signUpMutation.isPending}
              className="w-full py-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center gap-2 group mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>
                {signUpMutation.isPending
                  ? "Creating Account..."
                  : "Create Account & Claim 15% Off"}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream"></div>
            </div>
            <span className="relative bg-white px-4 text-xs text-muted font-medium uppercase tracking-wider">
              Or register with
            </span>
          </div>

          {/* Social Registrations */}
          <SocialAuthButtons mode="register" />
        </div>
      </div>
    </main>
      <CtaBanner
        eyebrow="Members Get More"
        title="Join the Bangkok Mango Circle"
        description="Fifteen percent off reorders, free express delivery and a festive gift-box sampler with your first order."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="Already a Member"
        secondaryHref="/login"
      />
    </>
  );
}
