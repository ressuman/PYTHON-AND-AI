/**
 * Receipt upload validation.
 * Enforces file type allowlist and size limits server-side.
 */
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export type UploadResult =
  | { ok: true; filename: string; mimeType: string; size: number; buffer: Buffer }
  | { ok: false; error: string };

export function validateUpload(file: File): UploadResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return { ok: false, error: `File type ${file.type} is not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(", ")}` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit` };
  }

  if (file.size === 0) {
    return { ok: false, error: "File is empty" };
  }

  return { ok: true, filename: file.name, mimeType: file.type, size: file.size, buffer: Buffer.from([]) };
}
