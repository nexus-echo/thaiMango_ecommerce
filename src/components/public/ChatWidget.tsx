"use client";

import Link from "next/link";
import {
  ArrowRight,
  Headset,
  MessageCircle,
  Package,
  Search,
  Send,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStore } from "./store";
import DoodleBackdrop from "./DoodleBackdrop";
import { withReturnTo } from "@/lib/returnTo";

/* Quick-help chat. There is no live agent behind it: a scripted concierge
   "types" its lines one by one and every answer ends in a link to the page
   that actually handles the request. */

type Topic = "recommend" | "founder" | "orders" | "team";
type BotLine = { text: string; eyebrow?: string; link?: { href: string; label: string } };
type Msg = BotLine & { id: number; from: "bot" | "user" };

const TOPICS: { id: Topic; label: string; icon: LucideIcon }[] = [
  { id: "recommend", label: "Recommend a product for me", icon: Search },
  { id: "founder", label: "Meet our founder", icon: UserRound },
  { id: "orders", label: "Track & manage my orders", icon: Package },
  { id: "team", label: "Talk to our team", icon: Headset },
];

const CONTACT_HREF = "/contact#contact-form";
const OTHER_HREF = `/contact?topic=${encodeURIComponent("Other Questions")}#contact-form`;

function replyFor(topic: Topic, loggedIn: boolean): BotLine[] {
  switch (topic) {
    case "recommend":
      return [
        {
          text: "Every pack is sun-dried Thai mango — from plain & natural to chili-lime, honey-glazed and beetroot fusion. Browse the range and filter by what you're craving:",
          link: { href: "/shop", label: "Browse all flavors" },
        },
      ];
    case "founder":
      return [
        {
          text: "Meet the person behind Bangkok Mango and how it all began:",
          link: { href: "/about-us#founder", label: "Read the founder's story" },
        },
      ];
    case "orders":
      return loggedIn
        ? [
            {
              text: "Your orders, tracking and reorders all live in your dashboard:",
              link: { href: "/dashboard", label: "Open my orders" },
            },
          ]
        : [
            {
              text: "Sign in and your orders will be waiting for you in your dashboard:",
              link: { href: withReturnTo("/login", "/dashboard"), label: "Sign in to see orders" },
            },
          ];
    case "team":
      return [
        {
          text: "Our care team answers every message personally, within 24 business hours. Drop us a note:",
          link: { href: CONTACT_HREF, label: "Message our team" },
        },
      ];
  }
}

/* Long enough to read as typing, short enough not to feel like waiting. */
const typingMs = (text: string) => Math.min(1400, 500 + text.length * 10);

export default function ChatWidget() {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState<Topic[]>([]);
  const [draft, setDraft] = useState("");

  const started = useRef(false);
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* Keep the newest line in view as the bot types. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, busy]);

  const push = (msg: Omit<Msg, "id">) =>
    setMessages((m) => [...m, { ...msg, id: nextId.current++ }]);

  /* Plays bot lines in order: a beat, the typing dots, then the bubble. */
  const say = (lines: BotLine[]) => {
    setBusy(true);
    let at = 0;
    for (const line of lines) {
      at += 350;
      timers.current.push(setTimeout(() => setTyping(true), at));
      at += typingMs(line.text);
      timers.current.push(
        setTimeout(() => {
          setTyping(false);
          push({ from: "bot", ...line });
        }, at),
      );
    }
    timers.current.push(setTimeout(() => setBusy(false), at + 250));
  };

  const toggle = () => {
    setOpen((o) => !o);
    if (started.current) return;
    started.current = true;
    const name = user?.isLoggedIn && user.firstName ? `, ${user.firstName}` : "";
    say([
      {
        eyebrow: "Mango Concierge",
        text: `Sawasdee${name}! I'm here to help you find your flavor, meet the people behind Bangkok Mango, or check on an order.`,
      },
      { text: "What can I help you with today?" },
    ]);
  };

  const pick = (topic: Topic) => {
    const chosen = TOPICS.find((t) => t.id === topic)!;
    const remaining = TOPICS.length - used.length - 1;
    setUsed((u) => [...u, topic]);
    push({ from: "user", text: chosen.label });
    say([
      ...replyFor(topic, Boolean(user?.isLoggedIn)),
      ...(remaining > 0 ? [{ text: "Anything else I can help with?" }] : []),
    ]);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    push({ from: "user", text });
    say([
      {
        text: "Thanks for writing in! I'm the quick-help assistant, so for anything specific our care team will reply to you personally.",
        link: { href: OTHER_HREF, label: "Send it to our team" },
      },
    ]);
  };

  const chips = TOPICS.filter((t) => !used.includes(t.id));

  return (
    <>
      <button
        id="chat-fab"
        className="fixed bottom-23 right-5 lg:bottom-6 z-40 w-14 h-14 rounded-full bg-charcoal text-ivory flex items-center justify-center shadow-xl hover:scale-105 transition"
        aria-label={open ? "Close help chat" : "Open help chat"}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={toggle}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <div
        id="chat-panel"
        role="dialog"
        aria-label="Bangkok Mango help chat"
        inert={!open}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={`fixed inset-x-4 bottom-40 lg:inset-x-auto lg:bottom-24 lg:right-8 lg:w-95 h-[min(560px,calc(100dvh-16rem))] lg:h-[min(580px,calc(100dvh-8rem))] bg-ivory rounded-3xl shadow-2xl z-50 transition-all duration-300 flex flex-col overflow-hidden border border-cream ${
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="relative shrink-0 bg-burgundy text-ivory px-5 py-4 flex items-center gap-3 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-10 w-56 aspect-square rounded-full opacity-30 bg-[radial-gradient(circle,var(--color-mango)_0%,transparent_65%)]"
          />
          <span className="relative shrink-0">
            <img
              src="/icon.svg"
              alt=""
              className="w-11 h-11 rounded-full ring-2 ring-gold/30"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-burgundy" />
          </span>
          <div className="relative flex-1 min-w-0">
            <h3 className="font-serif text-lg leading-tight">Mango Concierge</h3>
            <p className="text-[11px] text-gold/80">Bangkok Mango · replies instantly</p>
          </div>
          <button
            id="close-chat"
            className="relative w-9 h-9 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center transition shrink-0"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation */}
        <div className="relative flex-1 min-h-0">
          <DoodleBackdrop src="/images/doodles/mango.svg" tile={340} className="text-accent opacity-[0.07]" />
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="relative h-full overflow-y-auto no-scrollbar px-4 py-5 space-y-3"
          >
            {messages.map((m) =>
              m.from === "bot" ? (
                <div
                  key={m.id}
                  className="chat-msg-in max-w-[85%] bg-white rounded-2xl rounded-tl-md border border-cream shadow-sm px-4 py-3 text-[13px] leading-relaxed text-charcoal"
                >
                  {m.eyebrow && (
                    <span className="block text-[10px] uppercase tracking-widest font-bold text-accent mb-1">
                      {m.eyebrow}
                    </span>
                  )}
                  {m.text}
                  {m.link && (
                    <Link
                      href={m.link.href}
                      onClick={() => setOpen(false)}
                      className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-charcoal text-ivory px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition group"
                    >
                      {m.link.label}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="chat-msg-in ml-auto w-fit max-w-[80%] bg-charcoal text-ivory rounded-2xl rounded-tr-md px-4 py-2.5 text-[13px] leading-relaxed"
                >
                  {m.text}
                </div>
              ),
            )}

            {typing && (
              <div
                className="chat-msg-in w-fit bg-white rounded-2xl rounded-tl-md border border-cream shadow-sm px-4 py-3.5 flex items-center gap-1.5"
                aria-label="Mango Concierge is typing"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="chat-typing-dot w-1.5 h-1.5 rounded-full bg-accent"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}

            {!busy && messages.length > 0 && chips.length > 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {chips.map(({ id, label, icon: Icon }, i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="chat-msg-in inline-flex items-center gap-2 rounded-full bg-white border border-cream shadow-sm px-4 py-2 text-[12px] font-semibold text-charcoal hover:border-accent hover:text-accent transition"
                  >
                    <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-cream bg-white px-3 pt-3 pb-2">
          <form onSubmit={send} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
              maxLength={500}
              className="flex-1 min-w-0 rounded-full border border-cream bg-ivory/40 px-4 py-2.5 text-[13px] text-charcoal focus:outline-none focus:border-accent focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0 hover:bg-burgundy transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-muted text-center mt-2">
            By chatting you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="underline hover:text-accent"
              onClick={() => setOpen(false)}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
