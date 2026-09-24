"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { normalizeImagePath } from "@/lib/images";
import { uploadErrorMessage, uploadImages, type UploadFolder } from "./uploadImages";

interface SingleImageUploaderProps {
  /** Current image path, or null when none is set. */
  value: string | null;
  onChange: (next: string | null) => void;
  folder: UploadFolder;
  /** Tailwind aspect class for the preview, e.g. "aspect-2/1". */
  aspectClass?: string;
  hint?: string;
  /** Alt text for the preview. */
  alt?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export default function SingleImageUploader({
  value,
  onChange,
  folder,
  aspectClass = "aspect-2/1",
  hint,
  alt = "Category image",
}: SingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [manualPath, setManualPath] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const [url] = await uploadImages([file], folder);
      onChange(url);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function applyManualPath() {
    const path = normalizeImagePath(manualPath);
    if (!path) return;
    /* The server additionally checks https URLs belong to our S3 bucket. */
    if (!/^(\/(?!\/)|https:\/\/)/.test(path)) {
      setError("Use a site path (/images/…) or an https link to our S3 bucket");
      return;
    }
    setError("");
    onChange(path);
    setManualPath("");
  }

  const browse = () => fileInputRef.current?.click();

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          /* Reset so re-picking the same file still fires onChange. */
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(
            Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"))
          );
        }}
        onClick={value ? undefined : browse}
        className={`group relative w-full ${aspectClass} rounded-2xl overflow-hidden border-2 border-dashed transition ${
          dragging
            ? "border-accent bg-accent/5"
            : value
              ? "border-transparent"
              : "border-cream hover:border-accent/50 bg-white cursor-pointer"
        }`}
      >
        {value && (
          <Image
            src={normalizeImagePath(value)}
            alt={alt}
            fill
            sizes="(min-width: 640px) 480px, 100vw"
            className="object-cover"
            unoptimized
          />
        )}

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-sm font-medium">Uploading…</span>
          </div>
        ) : value ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={browse}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-charcoal text-[11px] font-bold uppercase tracking-wider hover:bg-cream transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-charcoal text-[11px] font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="w-11 h-11 rounded-full bg-cream/60 flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm font-semibold text-charcoal">
              Drop an image here, or click to browse
            </p>
            <p className="text-[11px] text-muted">JPG, PNG, WebP or AVIF · up to 5MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}

      {/* Escape hatch for images already in S3 or /public/images */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60"
          placeholder="Or paste an existing S3 link or site path"
          value={manualPath}
          onChange={(e) => setManualPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyManualPath();
            }
          }}
        />
        <button
          type="button"
          onClick={applyManualPath}
          disabled={!manualPath.trim()}
          className="px-4 py-2.5 rounded-xl border border-cream bg-white text-xs font-bold uppercase tracking-wider text-charcoal hover:border-accent disabled:opacity-40 transition"
        >
          Use
        </button>
      </div>

      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}
