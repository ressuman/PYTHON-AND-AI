import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createCategorySchema } from "@/lib/schemas";
import { ok, notFound, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createCategorySchema.partial().parse(body);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return notFound("Category not found");

    const data: Record<string, unknown> = {};
    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.color !== undefined) data.color = parsed.color;
    if (parsed.icon !== undefined) data.icon = parsed.icon;

    const category = await prisma.category.update({ where: { id }, data });
    return ok(category);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("PATCH /api/categories/[id] failed:", err);
    return serverError();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const { id } = await params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return notFound("Category not found");

    await prisma.category.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/categories/[id] failed:", err);
    return serverError();
  }
}
