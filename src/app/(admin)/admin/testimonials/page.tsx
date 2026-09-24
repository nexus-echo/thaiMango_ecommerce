"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Link2,
  Link2Off,
  MessageSquareQuote,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import TestimonialImage from "@/components/common/TestimonialImage";
import { unwrap } from "@/lib/http";
import { testimonialSchema, TestimonialValues } from "@/schemas/testimonial.schema";

interface SourceReview {
  id: number;
  rating: number;
  user: { name: string };
  product: { name_en: string; slug: string };
}

interface AdminTestimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  rating: number;
  image: string | null;
  review_id: number | null;
  position: number;
  is_active: boolean;
  created_at: string;
  review: SourceReview | null;
}

/* Same shape /api/admin/reviews returns (and the Reviews page caches). */
interface AdminReview {
  id: number;
  rating: number;
  text: string;
  status: "PENDING" | "PUBLISHED";
  created_at: string;
  product: { name_en: string; slug: string };
  user: { name: string };
}

const EMPTY: TestimonialValues = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  image: null,
  review_id: null,
  position: 0,
  is_active: true,
};

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

function Stars({ n, className = "w-3.5 h-3.5" }: { n: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${
            i <= n ? "text-amber-400 fill-amber-400" : "text-muted/50"
          }`}
        />
      ))}
    </span>
  );
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  /* Label for the review the open form is linked to (for the banner). */
  const [linkedReview, setLinkedReview] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

  const testimonialsQuery = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => unwrap<AdminTestimonial[]>(axios.get("/api/admin/testimonials")),
  });

  /* Only loaded once the admin opens the picker. */
  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => unwrap<AdminReview[]>(axios.get("/api/admin/reviews")),
    enabled: pickerOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<TestimonialValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: EMPTY,
  });

  const quote = useWatch({ control, name: "quote" }) ?? "";
  const reviewId = useWatch({ control, name: "review_id" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: TestimonialValues) =>
      unwrap<unknown>(
        editingId === null
          ? axios.post("/api/admin/testimonials", values)
          : axios.patch(`/api/admin/testimonials/${editingId}`, values)
      ),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      unwrap<unknown>(axios.patch(`/api/admin/testimonials/${id}`, { is_active })),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(axios.delete(`/api/admin/testimonials/${id}`)),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const testimonials = testimonialsQuery.data ?? [];
  const usedReviewIds = new Set(
    testimonials.map((t) => t.review_id).filter((id): id is number => id !== null)
  );
  /* Pending reviews aren't offered — featuring one would publish it here
     while it's still unapproved on the product page. */
  const pickableReviews = (reviewsQuery.data ?? []).filter(
    (r) => r.status === "PUBLISHED" && !usedReviewIds.has(r.id)
  );

  const openCreate = () => {
    setEditingId(null);
    setLinkedReview(null);
    setServerError("");
    setPickerOpen(false);
    reset(EMPTY);
    setFormOpen(true);
  };

  const openFromReview = (review: AdminReview) => {
    setEditingId(null);
    setLinkedReview(`${review.user.name}'s review of ${review.product.name_en}`);
    setServerError("");
    setPickerOpen(false);
    reset({
      ...EMPTY,
      name: review.user.name,
      quote: review.text,
      rating: review.rating,
      review_id: review.id,
    });
    setFormOpen(true);
  };

  const openEdit = (t: AdminTestimonial) => {
    setEditingId(t.id);
    setLinkedReview(
      t.review ? `${t.review.user.name}'s review of ${t.review.product.name_en}` : null
    );
    setServerError("");
    setPickerOpen(false);
    reset({
      name: t.name,
      location: t.location,
      quote: t.quote,
      rating: t.rating,
      image: t.image,
      review_id: t.review_id,
      position: t.position,
      is_active: t.is_active,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setLinkedReview(null);
    setServerError("");
  };

  const activeCount = testimonials.filter((t) => t.is_active).length;

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle={
          testimonialsQuery.isPending
            ? "Loading…"
            : `${activeCount} of ${testimonials.length} shown on the storefront`
        }
      >
        <button
          onClick={() => {
            setPickerOpen((open) => !open);
            setFormOpen(false);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-accent text-accent text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition"
        >
          <MessageSquareQuote className="w-4 h-4" />
          Pick from Reviews
        </button>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </PageHeader>

      {/* Review picker */}
      {pickerOpen && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-cream">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">
                Pick a Customer Review
              </h2>
              <p className="text-xs text-muted mt-1">
                Published reviews that aren&apos;t featured yet. You can edit the text and
                add a photo before saving.
              </p>
            </div>
            <button
              onClick={() => setPickerOpen(false)}
              className="w-8 h-8 rounded-lg text-muted hover:text-charcoal hover:bg-cream transition flex items-center justify-center"
              aria-label="Close review picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-cream max-h-105 overflow-y-auto">
            {reviewsQuery.isPending ? (
              <p className="p-10 text-center text-muted text-sm">Loading reviews…</p>
            ) : reviewsQuery.isError ? (
              <p className="p-10 text-center text-rose-600 text-sm">
                {reviewsQuery.error.message}
              </p>
            ) : pickableReviews.length === 0 ? (
              <p className="p-10 text-center text-muted text-sm">
                No published reviews left to feature. Approve reviews under Reviews, or add a
                testimonial manually.
              </p>
            ) : (
              pickableReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 md:px-6 flex items-start justify-between gap-4 hover:bg-cream/20 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Stars n={r.rating} />
                      <span className="text-xs font-bold text-charcoal">{r.user.name}</span>
                      <span className="text-xs text-muted/70">on {r.product.name_en}</span>
                    </div>
                    <p className="text-sm text-charcoal/80 leading-relaxed line-clamp-2">
                      &ldquo;{r.text}&rdquo;
                    </p>
                  </div>
                  <button
                    onClick={() => openFromReview(r)}
                    className="shrink-0 px-4 py-2 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest hover:bg-burgundy transition"
                  >
                    Use
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Create / edit form */}
      {formOpen && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">
              {editingId === null ? "New Testimonial" : "Edit Testimonial"}
            </h2>
            <button
              onClick={closeForm}
              className="w-8 h-8 rounded-lg text-muted hover:text-charcoal hover:bg-cream transition flex items-center justify-center"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {reviewId != null && linkedReview && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-cream/50 border border-cream">
              <span className="inline-flex items-center gap-2 text-xs text-charcoal">
                <Link2 className="w-4 h-4 text-accent" />
                From {linkedReview} — shown as a verified buyer.
              </span>
              <button
                type="button"
                onClick={() => setValue("review_id", null, { shouldDirty: true })}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted hover:text-rose-600 transition"
              >
                <Link2Off className="w-3.5 h-3.5" />
                Unlink
              </button>
            </div>
          )}

          <form
            onSubmit={handleSubmit((values) => {
              setServerError("");
              saveMutation.mutate(values);
            })}
            className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-x-8 gap-y-6"
          >
            {/* Left: text fields */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Name</label>
                  <input className={inputCls} placeholder="Ploy S." {...register("name")} />
                  {errors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Location / Title (optional)</label>
                  <input
                    className={inputCls}
                    placeholder="Bangkok"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Quote</label>
                <textarea
                  rows={5}
                  className={`${inputCls} resize-y`}
                  placeholder="What did they say?"
                  {...register("quote")}
                />
                <div className="flex justify-between mt-1">
                  {errors.quote ? (
                    <p className="text-[11px] text-rose-600">{errors.quote.message}</p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-[11px] ${quote.length > 600 ? "text-rose-600" : "text-muted"}`}
                  >
                    {quote.length}/600
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Rating</label>
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <div className="flex items-center gap-1 h-10.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => field.onChange(i)}
                            aria-label={`${i} star${i === 1 ? "" : "s"}`}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-5 h-5 transition ${
                                i <= field.value
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted/40 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.rating && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.rating.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Position</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    {...register("position", { valueAsNumber: true })}
                  />
                  {errors.position ? (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.position.message}</p>
                  ) : (
                    <p className="text-[11px] text-muted mt-1">Lower shows first.</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Visibility</label>
                  <label className="flex items-center gap-2.5 h-10.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-accent"
                      {...register("is_active")}
                    />
                    <span className="text-sm text-charcoal">Show on storefront</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: photo */}
            <div>
              <label className={labelCls}>Photo</label>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <SingleImageUploader
                    value={field.value ?? null}
                    onChange={field.onChange}
                    folder="testimonials"
                    aspectClass="aspect-square"
                    alt="Testimonial photo"
                    hint="A square photo of the customer works best. Without one — or if it fails to load — the storefront shows the default image."
                  />
                )}
              />
              {errors.image && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.image.message}</p>
              )}
            </div>

            <div className="lg:col-span-2 flex items-center gap-3 pt-5 border-t border-cream">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition disabled:opacity-60"
              >
                {saveMutation.isPending
                  ? "Saving…"
                  : editingId === null
                    ? "Create Testimonial"
                    : "Save Changes"}
              </button>
              {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
            </div>
          </form>
        </Card>
      )}

      {serverError && !formOpen && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {/* List */}
      {testimonialsQuery.isPending ? (
        <p className="text-sm text-muted py-16 text-center">Loading testimonials…</p>
      ) : testimonials.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted">
            No testimonials yet. Write one, or pick a customer review to feature. The
            storefront section stays hidden until at least one is shown.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className={`p-6 flex flex-col ${t.is_active ? "" : "opacity-70"}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-cream">
                  <TestimonialImage src={t.image} alt={t.name} sizes="56px" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-charcoal truncate">{t.name}</h3>
                  {t.location && (
                    <p className="text-xs text-muted truncate">{t.location}</p>
                  )}
                  <div className="mt-1">
                    <Stars n={t.rating} />
                  </div>
                </div>
                <StatusBadge status={t.is_active ? "Active" : "Hidden"} />
              </div>

              <p className="text-sm text-charcoal/80 leading-relaxed line-clamp-4 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-cream">
                <span className="text-[11px] text-muted truncate">
                  {t.review ? `From review · ${t.review.product.name_en}` : "Custom"}
                  {" · "}#{t.position}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setServerError("");
                      toggleMutation.mutate({ id: t.id, is_active: !t.is_active });
                    }}
                    disabled={toggleMutation.isPending}
                    className="w-8 h-8 rounded-lg text-muted hover:text-accent hover:bg-cream transition flex items-center justify-center disabled:opacity-50"
                    aria-label={t.is_active ? `Hide ${t.name}` : `Show ${t.name}`}
                    title={t.is_active ? "Hide from storefront" : "Show on storefront"}
                  >
                    {t.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="w-8 h-8 rounded-lg text-muted hover:text-accent hover:bg-cream transition flex items-center justify-center"
                    aria-label={`Edit ${t.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete the testimonial from "${t.name}"?`)) {
                        setServerError("");
                        deleteMutation.mutate(t.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="w-8 h-8 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center disabled:opacity-50"
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
