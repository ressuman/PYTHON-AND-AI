import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const body = await request.json();
    const { message } = body as { message?: string };

    if (!message || typeof message !== "string") {
      return badRequest("Message is required and must be a string");
    }

    // Agent runtime integration placeholder.
    // When pi-coding-agent is configured, instantiate the agent here and call it.
    return ok({ response: `Agent received: "${message}". Processing not yet wired.` });
  } catch (err) {
    console.error("POST /api/agent failed:", err);
    return serverError();
  }
}
