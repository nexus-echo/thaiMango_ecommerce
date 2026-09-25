"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Check, ExternalLink, RotateCcw, UserRound } from "lucide-react";
import { Card } from "@/components/admin/ui";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { unwrap } from "@/lib/http";
import { FOUNDER_FIELDS, type FounderFieldId } from "@/schemas/siteContent.schema";

interface ContentBlock {
  id: string;
  content: string;
  updated_at: string;
}

type Draft = Record<FounderFieldId, string>;

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

function toDraft(blocks: Map<string, ContentBlock>): Draft {
  return Object.fromEntries(
    FOUNDER_FIELDS.map((f) => [f.id, blocks.get(f.id)?.content ?? ""])
  ) as Draft;
}

/* Edits every block behind the home page's founder section (#our-founder)
   in one form, instead of one generic card per field. */
export default function FounderContentCard({ blocks }: { blocks: ContentBlock[] }) {
  const queryClient = useQueryClient();
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const saved = toDraft(byId);
  const [draft, setDraft] = useState<Draft>(saved);
  const [error, setError] = useState("");

  const missing = FOUNDER_FIELDS.filter((f) => !byId.has(f.id));
  const changed = FOUNDER_FIELDS.filter((f) => draft[f.id] !== saved[f.id]);
  const empty = FOUNDER_FIELDS.filter((f) => !draft[f.id].trim());

  const saveMutation = useMutation({
    mutationFn: () =>
      Promise.all(
        changed.map((f) =>
          unwrap<unknown>(
            axios.patch(`/api/admin/site-content/${f.id}`, { content: draft[f.id] })
          )
        )
      ),
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (err: Error) => {
      setError(err.message);
      /* Some fields may have saved before one failed — resync with the DB. */
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
    },
  });

  const set = (id: FounderFieldId, value: string) =>
    setDraft((d) => ({ ...d, [id]: value }));

  const lastUpdated = blocks.reduce<string | null>(
    (latest, b) => (!latest || b.updated_at > latest ? b.updated_at : latest),
    null
  );

  const textFields = FOUNDER_FIELDS.filter((f) => f.kind !== "image");

  return (
    <Card className="p-5 md:p-6 md:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center shrink-0">
            <UserRound className="w-4 h-4 text-accent" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal">
              Founder Section
            </h3>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
              Home · Our Founder
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/#our-founder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream text-xs font-semibold text-charcoal/80 hover:border-accent hover:text-accent transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on site
          </a>
          <button
            type="button"
            onClick={() => {
              setError("");
              setDraft(saved);
            }}
            disabled={changed.length === 0 || saveMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream text-xs font-semibold text-charcoal/80 hover:border-accent hover:text-accent transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={
              changed.length === 0 ||
              empty.length > 0 ||
              missing.length > 0 ||
              saveMutation.isPending
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:bg-burgundy transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Some founder fields don&apos;t exist yet ({missing.map((f) => f.label).join(", ")}) —
          run <code>bun run seed</code> to create them.
        </div>
      )}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mt-5">
        <div>
          <label className={labelCls}>Photo</label>
          <SingleImageUploader
            value={draft.founder_image || null}
            onChange={(next) => set("founder_image", next ?? "")}
            folder="site-content"
            aspectClass="aspect-[5/7]"
            alt="Founder photo"
            hint="Shown in a portrait (5:7) frame on the home page. Required — the section always shows a photo."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textFields.map((field) => (
            <div
              key={field.id}
              className={field.kind === "textarea" || field.id === "founder_name" ? "sm:col-span-2" : ""}
            >
              <label htmlFor={field.id} className={labelCls}>
                {field.label}
              </label>
              {field.kind === "textarea" ? (
                <textarea
                  id={field.id}
                  rows={3}
                  value={draft[field.id]}
                  onChange={(e) => set(field.id, e.target.value)}
                  className={`${inputCls} resize-y`}
                />
              ) : (
                <input
                  id={field.id}
                  value={draft[field.id]}
                  onChange={(e) => set(field.id, e.target.value)}
                  className={inputCls}
                />
              )}
              {!draft[field.id].trim() && (
                <p className="text-[11px] text-rose-600 mt-1">Required</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {lastUpdated && (
        <p className="text-[11px] text-muted/70 mt-4">
          Last updated {new Date(lastUpdated).toLocaleDateString("en-IN")}
        </p>
      )}
    </Card>
  );
}
