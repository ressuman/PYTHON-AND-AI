import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createCategorySchema } from "@/lib/schemas";
import { ok, created, notFound, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return ok(categories);
  } catch (err) {
    console.error("GET /api/categories failed:", err);
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
    const parsed = createCategorySchema.parse(body);

    const category = await prisma.category.create({ data: parsed });
    return created(category);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("POST /api/categories failed:", err);
    return serverError();
  }
}
