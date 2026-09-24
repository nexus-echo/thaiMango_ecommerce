import axios from "axios";

export type UploadFolder = "products" | "categories" | "testimonials";

interface UploadedImage {
  url: string;
  name: string;
  size: number;
}

/** Posts files to /api/admin/upload and returns their public paths. */
export async function uploadImages(
  files: File[],
  folder: UploadFolder = "products"
): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("folder", folder);

  const res = await axios.post<{ data: UploadedImage[] }>(
    "/api/admin/upload",
    formData
  );
  return res.data.data.map((img) => img.url);
}

/** The route returns per-file reasons in `errors` when a batch is rejected. */
export function uploadErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response) {
    const body = err.response.data as
      | { errors?: unknown[]; message?: string }
      | null;
    const detail =
      body && Array.isArray(body.errors) && body.errors.length > 0
        ? body.errors.join(" · ")
        : body?.message;
    return detail || "Upload failed";
  }
  return err instanceof Error ? err.message : "Upload failed";
}
