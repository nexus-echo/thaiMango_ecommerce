"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Minus, Plus } from "lucide-react";
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
 * question at normal weight, and a light "+" at the far right. Opening a row
 * turns its header into a solid burgundy bar and drops the answer into a
 * tinted panel beneath it, so an open question reads as a heading over its
 * answer rather than as one more row in the list.
 *
 * IMPORTANT: no element here may carry both `reveal` and `accordion-item`.
 * ScrollEffects marks a `.reveal` element `active` when it scrolls into view,
 * and `.accordion-item.active .accordion-panel` is what opens a panel — put
 * both on one node and every answer springs open on scroll and can never be
 * closed again. The stagger lives on the wrapper for that reason.
 *
 * Reads the same /api/faqs resource the FAQ page does rather than carrying its
 * own copy, so an admin answering a question once answers it in both places.
 */
export default function ProductFaq() {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

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
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <h2 className="reveal mb-10 text-center font-serif text-[1.75rem] font-semibold tracking-[-0.01em] text-charcoal md:mb-12 md:text-4xl">
          You Ask, We Answer
        </h2>

        <div className="reveal mx-auto max-w-6xl space-y-2.5">
          {items.map((item) => {
            const open = openIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`accordion-item overflow-hidden rounded-lg border shadow-[0_1px_2px_rgba(10,10,10,0.04)] transition-colors duration-200 ${
                  open
                    ? "active border-burgundy"
                    : "border-cream bg-white hover:border-accent/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={open}
                  className={`flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-colors duration-200 md:px-7 ${
                    open ? "bg-burgundy" : "bg-white"
                  }`}
                >
                  <span
                    className={`flex-1 text-sm leading-snug md:text-[15px] ${
                      open ? "text-ivory" : "text-charcoal"
                    }`}
                  >
                    <span
                      className={`mr-1.5 font-bold ${
                        open ? "text-gold" : "text-accent"
                      }`}
                    >
                      Q.
                    </span>
                    {item.question}
                  </span>
                  {open ? (
                    <Minus className="h-4 w-4 shrink-0 text-ivory/80" strokeWidth={1.75} />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted/70" strokeWidth={1.75} />
                  )}
                </button>

                <div className="accordion-panel bg-cream/40">
                  <div className="px-5 py-5 md:px-7">
                    <p className="text-xs leading-relaxed text-muted md:text-sm">
                      <span className="mr-1.5 font-bold text-accent">A.</span>
                      {item.answer}
                    </p>
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
