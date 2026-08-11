/**
 * Single-user auth gate.
 * Expects the API key in the Authorization header.
 * The key is read from APP_API_KEY env variable.
 */
import { NextRequest } from "next/server";
import { badRequest } from "@/lib/errors";

export function requireAuth(request: NextRequest): null | ReturnType<typeof badRequest> {
  const apiKey = process.env.APP_API_KEY;
  if (!apiKey) {
    // No key configured — allow access (development mode).
    return null;
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ") || header.slice(7) !== apiKey) {
    return badRequest("Unauthorized");
  }

  return null;
}
