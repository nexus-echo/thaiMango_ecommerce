import type { NextConfig } from "next";

/* Admin uploads are stored in S3 and rendered with next/image, which only
   optimizes remote images from allowed hosts. Mirrors s3PublicBase() in
   src/lib/s3.ts (S3_PUBLIC_URL, else <endpoint>/<bucket>). */
const s3PublicBase =
  process.env.S3_PUBLIC_URL ||
  (process.env.S3_ENDPOINT && process.env.S3_BUCKET
    ? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`
    : "");

const nextConfig: NextConfig = {
  images: {
    /* Next 16 allows only [75] by default; 90 is used by the Our Story
       slide crops (Why Choose + Fermentation), which are already compressed
       once in the source JPEG and visibly degrade at 75. */
    qualities: [75, 90],
    remotePatterns: s3PublicBase
      ? [new URL(`${s3PublicBase.replace(/\/+$/, "")}/**`)]
      : [],
  },
};

export default nextConfig;
