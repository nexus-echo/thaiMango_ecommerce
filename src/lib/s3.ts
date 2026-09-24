import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/* Server-only: reads the S3 credentials from the environment. The endpoint
   is MinIO, which needs path-style URLs (<endpoint>/<bucket>/<key>). */

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set`);
    return value;
}

const globalForS3 = globalThis as unknown as { s3?: S3Client };

function client(): S3Client {
    globalForS3.s3 ??= new S3Client({
        endpoint: requireEnv("S3_ENDPOINT"),
        region: process.env.S3_REGION || "us-east-1",
        forcePathStyle: true,
        credentials: {
            accessKeyId: requireEnv("S3_ACCESS_KEY"),
            secretAccessKey: requireEnv("S3_SECRET_KEY"),
        },
    });
    return globalForS3.s3;
}

/** Base URL objects are publicly read from. S3_PUBLIC_URL overrides it
 *  (e.g. a CDN in front of the bucket); otherwise it is the path-style URL. */
export function s3PublicBase(): string {
    const base =
        process.env.S3_PUBLIC_URL ||
        `${requireEnv("S3_ENDPOINT")}/${requireEnv("S3_BUCKET")}`;
    return base.replace(/\/+$/, "");
}

export function s3PublicUrl(key: string): string {
    return `${s3PublicBase()}/${key}`;
}

/** True when `url` points into our bucket's public base. */
export function isS3PublicUrl(url: string): boolean {
    return url.startsWith(`${s3PublicBase()}/`);
}

/** Image sources the storefront can render: site paths or our S3 bucket. */
export function isAllowedImageSrc(src: string): boolean {
    return (src.startsWith("/") && !src.startsWith("//")) || isS3PublicUrl(src);
}

export async function uploadToS3(
    key: string,
    body: Buffer,
    contentType: string
): Promise<string> {
    await client().send(
        new PutObjectCommand({
            Bucket: requireEnv("S3_BUCKET"),
            Key: key,
            Body: body,
            ContentType: contentType,
            /* Keys carry a random suffix, so an object never changes once written. */
            CacheControl: "public, max-age=31536000, immutable",
        })
    );
    return s3PublicUrl(key);
}
