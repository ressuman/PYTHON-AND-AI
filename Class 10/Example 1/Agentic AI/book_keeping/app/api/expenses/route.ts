import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/schemas";
import { ok, created, notFound, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, unknown>).gte = new Date(from);
      if (to) (where.date as Record<string, unknown>).lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true, receipt: true },
      orderBy: { date: "desc" },
    });

    return ok(expenses);
  } catch (err) {
    console.error("GET /api/expenses failed:", err);
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
    const parsed = createExpenseSchema.parse(body);

    const category = await prisma.category.findUnique({ where: { id: parsed.categoryId } });
    if (!category) {
      return badRequest("Category not found");
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parsed.amount,
        description: parsed.description,
        categoryId: parsed.categoryId,
        date: new Date(parsed.date),
        notes: parsed.notes,
        receiptId: parsed.receiptId,
      },
      include: { category: true },
    });

    return created(expense);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("POST /api/expenses failed:", err);
    return serverError();
  }
}
