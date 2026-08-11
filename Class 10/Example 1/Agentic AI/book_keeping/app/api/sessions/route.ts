import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sessionMetadataSchema } from "@/lib/schemas";
import { ok, created, notFound, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    return ok(sessions);
  } catch (err) {
    console.error("GET /api/sessions failed:", err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const body = await request.json();
    const parsed = sessionMetadataSchema.parse(body);

    const session = await prisma.session.create({
      data: { title: parsed.title, messages: [] },
    });

    return created(session);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("POST /api/sessions failed:", err);
    return serverError();
  }
}
