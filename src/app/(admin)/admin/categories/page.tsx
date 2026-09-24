"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ImageOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { unwrap } from "@/lib/http";
import { normalizeImagePath } from "@/lib/images";
import { categorySchema, CategoryValues } from "@/schemas/category.schema";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface AdminCategory {
  id: number;
  slug: string;
  name_en: string;
  name_th: string;
  image: string | null;
  cat_id: number | null;
  _count: { products: number };
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serverError, setServerError] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => unwrap<AdminCategory[]>(axios.get("/api/admin/categories")),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema) });

  const nameEn = useWatch({ control, name: "name_en" });

  /* Slug is always derived from the English name — the field is read-only. */
  useEffect(() => {
    setValue("slug", slugify(nameEn ?? ""), { shouldValidate: true });
  }, [nameEn, setValue]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: CategoryValues) =>
      unwrap<unknown>(
        editingId === null
          ? axios.post("/api/admin/categories", values)
          : axios.patch(`/api/admin/categories/${editingId}`, values)
      ),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(axios.delete(`/api/admin/categories/${id}`)),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setServerError("");
    reset({ slug: "", name_en: "", name_th: "", image: null });
    setFormOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setServerError("");
    reset({
      slug: cat.slug,
      name_en: cat.name_en,
      name_th: cat.name_th,
      image: cat.image,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setServerError("");
  };

  const categories = categoriesQuery.data ?? [];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={
          categoriesQuery.isPending
            ? "Loading…"
            : `${categories.length} product categor${categories.length === 1 ? "y" : "ies"}`
        }
      >
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </PageHeader>

      {formOpen && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">
              {editingId === null ? "New Category" : "Edit Category"}
            </h2>
            <button
              onClick={closeForm}
              className="w-8 h-8 rounded-lg text-muted hover:text-charcoal hover:bg-cream transition flex items-center justify-center"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit((values) => {
              setServerError("");
              saveMutation.mutate(values);
            })}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6"
          >
            {/* Left: text fields */}
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Name (English)</label>
                <input className={inputCls} placeholder="Classic Cuts" {...register("name_en")} />
                {errors.name_en && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.name_en.message}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Name (Thai)</label>
                <input className={inputCls} placeholder="คลาสสิก" {...register("name_th")} />
                {errors.name_th && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.name_th.message}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  className={`${inputCls} bg-ivory text-muted cursor-not-allowed`}
                  placeholder="classic-cuts"
                  readOnly
                  {...register("slug")}
                />
                <p className="text-[11px] text-muted mt-1">
                  Auto-generated from the English name.
                </p>
                {errors.slug && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.slug.message}</p>
                )}
              </div>
            </div>

            {/* Right: image */}
            <div>
              <label className={labelCls}>Category Image</label>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <SingleImageUploader
                    value={field.value ?? null}
                    onChange={field.onChange}
                    folder="categories"
                    hint="Shown on the homepage “Shop by Category” tiles and in the menu. A wide (2:1) photo works best. Without one, the storefront uses a product photo from this category."
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
                    ? "Create Category"
                    : "Save Changes"}
              </button>
              {serverError && (
                <p className="text-sm text-rose-600">{serverError}</p>
              )}
            </div>
          </form>
        </Card>
      )}

      {serverError && !formOpen && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {categoriesQuery.isPending ? (
        <p className="text-sm text-muted py-16 text-center">Loading categories…</p>
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted">
            No categories yet. Create one to start organizing products.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden">
              <div className="relative aspect-2/1 bg-cream/40">
                {cat.image ? (
                  <Image
                    src={normalizeImagePath(cat.image)}
                    alt={cat.name_en}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
                    <ImageOff className="w-5 h-5" />
                    <span className="text-[11px] font-medium">No image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-charcoal">
                      {cat.name_en}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      {cat.name_th} • {cat._count.products} product
                      {cat._count.products === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-8 h-8 rounded-lg text-muted hover:text-accent hover:bg-cream transition flex items-center justify-center"
                      aria-label={`Edit ${cat.name_en}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name_en}"?`)) {
                          setServerError("");
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="w-8 h-8 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center disabled:opacity-50"
                      aria-label={`Delete ${cat.name_en}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Slug: <code className="text-charcoal">{cat.slug}</code>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
