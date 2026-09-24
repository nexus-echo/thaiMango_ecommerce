import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { uploadToS3 } from "@/lib/s3";

/* Every upload goes to the S3 bucket as <folder>/<file> and is referenced by
   its public URL — nothing is written to the local disk. The folder comes
   from this whitelist, never straight from the request; anything else falls
   back to products. */
const UPLOAD_FOLDERS = new Set(["products", "categories", "testimonials"]);
const DEFAULT_FOLDER = "products";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;

/* The extension comes from this map, never from the uploaded filename, so a
   file can only ever be written as one of these types. SVG is excluded on
   purpose — it can carry script. */
const ALLOWED_TYPES = new Map<string, string>([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
    ["image/avif", ".avif"],
]);

/** "Sun Dried Mango.PNG" -> "sun-dried-mango" (basename only, never a path). */
function slugifyFilename(original: string) {
    const base = path.basename(original).replace(/\.[^.]+$/, "");
    const slug = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
    return slug || "product-image";
}

export async function POST(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const formData = await req.formData();
        const files = formData.getAll("files").filter((f): f is File => f instanceof File);
        const requestedFolder = formData.get("folder");
        const folder =
            typeof requestedFolder === "string" && UPLOAD_FOLDERS.has(requestedFolder)
                ? requestedFolder
                : DEFAULT_FOLDER;

        if (files.length === 0) {
            const apiError = new ApiError(400, "No files were uploaded");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        if (files.length > MAX_FILES_PER_REQUEST) {
            const apiError = new ApiError(
                400,
                `Upload up to ${MAX_FILES_PER_REQUEST} images at a time`
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Validate everything before writing anything, so a bad file in the
           batch doesn't leave half the images in the bucket. */
        const errors: string[] = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.has(file.type)) {
                errors.push(`${file.name}: unsupported type (use JPG, PNG, WebP or AVIF)`);
            } else if (file.size > MAX_FILE_BYTES) {
                errors.push(`${file.name}: larger than 5MB`);
            } else if (file.size === 0) {
                errors.push(`${file.name}: file is empty`);
            }
        }
        if (errors.length > 0) {
            const apiError = new ApiError(400, "Some files were rejected", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const uploaded: { url: string; name: string; size: number }[] = [];
        for (const file of files) {
            const ext = ALLOWED_TYPES.get(file.type)!;
            /* Random suffix keeps same-named uploads from overwriting each other. */
            const filename = `${slugifyFilename(file.name)}-${randomBytes(4).toString("hex")}${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            const url = await uploadToS3(`${folder}/${filename}`, buffer, file.type);
            uploaded.push({
                url,
                name: file.name,
                size: file.size,
            });
        }

        const apiResponse = new ApiResponse(201, uploaded, "Images uploaded successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin image upload failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
