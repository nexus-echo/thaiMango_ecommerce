"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FAQ_DEFAULTS, type FaqCategoryId } from "@/schemas/faq.schema";
import { unwrap } from "@/lib/http";

interface FaqRow {
  id: number;
  category: string;
  question: string;
  answer: string;
  position: number;
}

/* Which topics belong on a product page. "shipping" is deliberately left out:
   it is answered in the Shipping & Free Returns accordion in the buy box, and
   repeating it here pushes the product questions below the fold. */
const PRODUCT_TOPICS: FaqCategoryId[] = ["ingredients", "snacks"];

const MAX_QUESTIONS = 7;

/* One curve for every moving part (height, fade, colours, icon) so the open
   and close read as a single motion. Spelled out in full for Tailwind. */
const EASE = "ease-[cubic-bezier(0.4,0,0.2,1)]";

/* Pre-fetch fallback — the same seeded launch set the /faq page falls back to,
   with synthetic negative ids that can never collide with real rows. */
const FALLBACK_ROWS: FaqRow[] = FAQ_DEFAULTS.map((f, i) => ({
  id: -(i + 1),
  category: f.category,
  question: f.question,
  answer: f.answer,
  position: f.position,
}));

/**
 * "You Ask, We Answer" — the product-relevant slice of the site FAQ.
 *
 * Plain wide rows under a plain centred title: a bold "Q." marker, the
 * question at normal weight, and a light "+" at the far right. Every row is a
 * white card, open or closed — the open one only swaps its header to the
 * pouch's mango gold (black text, as on every gold band) and reveals the
 * answer on the same white beneath it, so it stays one card instead of
 * becoming a dark bar over a cream outline box.
 *
 * Only one answer is open at a time. The panels deliberately do NOT use the
 * global `.accordion-item` / `.accordion-panel` classes (still used by /faq):
 * those animate max-height to a fixed 400px, which stalls at one end of the
 * motion. Also, ScrollEffects adds `active` to `.reveal` elements, and
 * `.accordion-item.active` opens a panel — so never combine those two.
 *
 * Reads the same /api/faqs resource the FAQ page does rather than carrying its
 * own copy, so an admin answering a question once answers it in both places.
 */
export default function ProductFaq() {
  /* One question open at a time — opening another closes the current one. */
  const [openId, setOpenId] = useState<number | null>(null);

  const faqQuery = useQuery({
    queryKey: ["faqs"],
    queryFn: async (): Promise<FaqRow[]> => unwrap<FaqRow[]>(axios.get("/api/faqs")),
    staleTime: 5 * 60 * 1000,
  });

  const items = useMemo(() => {
    const rows = faqQuery.data?.length ? faqQuery.data : FALLBACK_ROWS;
    return rows
      .filter((r) => PRODUCT_TOPICS.includes(r.category as FaqCategoryId))
      .slice(0, MAX_QUESTIONS);
  }, [faqQuery.data]);

  if (items.length === 0) return null;

  const toggle = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <h2 className="reveal mb-10 text-center font-serif text-[1.75rem] font-semibold tracking-[-0.01em] text-charcoal md:mb-12 md:text-4xl">
          You Ask, We Answer
        </h2>

        <div className="reveal mx-auto max-w-6xl space-y-2.5">
          {items.map((item) => {
            const open = openId === item.id;
            const panelId = `product-faq-${item.id}`;
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] duration-300 ${EASE} ${
                  open
                    ? "border-mango shadow-[0_6px_20px_rgba(80,37,0,0.08)]"
                    : "border-white shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:border-mango/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  id={`${panelId}-q`}
                  className={`flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-colors duration-300 md:px-7 ${EASE} ${
                    open ? "bg-mango" : "bg-white"
                  }`}
                >
                  <span className="flex-1 text-sm leading-snug text-charcoal md:text-[15px]">
                    <span
                      className={`mr-1.5 font-bold transition-colors duration-300 ${
                        open ? "text-burgundy" : "text-accent"
                      }`}
                    >
                      Q.
                    </span>
                    {item.question}
                  </span>
                  {/* "+" whose vertical stroke folds away into a "−" */}
                  <span aria-hidden className="relative h-3.5 w-3.5 shrink-0">
                    <span
                      className={`absolute left-0 top-1/2 h-[1.75px] w-full -translate-y-1/2 rounded-full transition-colors duration-300 ${
                        open ? "bg-charcoal" : "bg-muted/70"
                      }`}
                    />
                    <span
                      className={`absolute left-1/2 top-0 h-full w-[1.75px] -translate-x-1/2 rounded-full bg-muted/70 transition-transform duration-300 ${EASE} ${
                        open ? "scale-y-0" : "scale-y-100"
                      }`}
                    />
                  </span>
                </button>

                {/* Animates to the answer's real height (0fr → 1fr) rather
                    than a guessed max-height, so there's no dead time at
                    either end of the motion. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={`${panelId}-q`}
                  inert={!open}
                  className={`grid transition-[grid-template-rows] duration-300 ${EASE} ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={`px-5 py-5 transition-opacity duration-300 md:px-7 md:py-6 ${EASE} ${
                        open ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-charcoal/75 md:text-[15px]">
                        <span className="mr-1.5 font-bold text-accent">A.</span>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="reveal mx-auto mt-9 max-w-6xl text-center text-xs text-muted md:text-sm">
          Still not answered?{" "}
          <Link
            href="/contact"
            className="font-semibold text-accent underline underline-offset-4 hover:text-charcoal"
          >
            Ask us directly
          </Link>{" "}
          — or read{" "}
          <Link
            href="/faq"
            className="font-semibold text-accent underline underline-offset-4 hover:text-charcoal"
          >
            every question we get
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
