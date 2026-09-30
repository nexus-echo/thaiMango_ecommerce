"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { unwrap } from "@/lib/http";
import { useStore } from "./store";

interface ContentBlock {
  id: string;
  content: string;
}

export default function AnnouncementBar() {
  const { t } = useStore();

  /* Admin-editable copy (Admin → Site Content); same query as the home page,
     so the two share one cached request. */
  const contentQuery = useQuery({
    queryKey: ["site-content"],
    queryFn: async (): Promise<ContentBlock[]> =>
      unwrap<ContentBlock[]>(axios.get("/api/site-content")),
    staleTime: 5 * 60 * 1000,
  });

  const text =
    contentQuery.data?.find((b) => b.id === "announcement_text")?.content.trim() ||
    t("marquee_welcome");

  return (
    <div
      id="top-bar"
      className="bg-charcoal text-ivory text-xs tracking-[0.2em] py-2.5 overflow-hidden uppercase relative flex items-center z-50"
    >
      <div className="marquee-content whitespace-nowrap flex space-x-12 px-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="marquee-item-text">
            {text}{" "}
            <Link
              href="/shop"
              className="underline ml-2 hover:text-accent transition"
            >
              {t("shop_now")}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
