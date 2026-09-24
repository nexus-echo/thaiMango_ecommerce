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
    remotePatterns: s3PublicBase
      ? [new URL(`${s3PublicBase.replace(/\/+$/, "")}/**`)]
      : [],
  },
};

export default nextConfig;
