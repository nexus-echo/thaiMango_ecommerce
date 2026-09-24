"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeImagePath, TESTIMONIAL_PLACEHOLDER } from "@/lib/images";

/**
 * A testimonial photo that always renders something: no image set → the
 * default image, and an image that fails to load (deleted from S3, bad link)
 * → the default image too. Fills its (relatively positioned) parent.
 */
export default function TestimonialImage({
  src,
  alt,
  sizes,
  className = "object-cover",
  unoptimized,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  unoptimized?: boolean;
}) {
  const wanted = src?.trim() ? normalizeImagePath(src) : TESTIMONIAL_PLACEHOLDER;
  /* Remember WHICH src failed rather than a boolean, so switching to a new
     src (e.g. the admin replaces the photo) gets a fresh attempt. */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const current = failedSrc === wanted ? TESTIMONIAL_PLACEHOLDER : wanted;

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      unoptimized={unoptimized}
      onError={() => {
        if (current !== TESTIMONIAL_PLACEHOLDER) setFailedSrc(wanted);
      }}
    />
  );
}
