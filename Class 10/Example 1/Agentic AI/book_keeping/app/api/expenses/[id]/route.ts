import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { updateExpenseSchema } from "@/lib/schemas";
import { ok, notFound, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const { id } = await params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { category: true, receipt: true },
    });

    if (!expense) return notFound("Expense not found");
    return ok(expense);
  } catch (err) {
    console.error("GET /api/expenses/[id] failed:", err);
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateExpenseSchema.parse(body);

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return notFound("Expense not found");

    const data: Record<string, unknown> = {};
    if (parsed.amount !== undefined) data.amount = parsed.amount;
    if (parsed.description !== undefined) data.description = parsed.description;
    if (parsed.categoryId !== undefined) data.categoryId = parsed.categoryId;
    if (parsed.date !== undefined) data.date = new Date(parsed.date);
    if (parsed.notes !== undefined) data.notes = parsed.notes;

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: { category: true },
    });

    return ok(expense);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("PATCH /api/expenses/[id] failed:", err);
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
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return notFound("Expense not found");

    await prisma.expense.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/expenses/[id] failed:", err);
    return serverError();
  }
}
