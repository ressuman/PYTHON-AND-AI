import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createExpenseSchema } from "@/lib/schemas";
import { ok, notFound, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { expenses: true },
    });
    if (!receipt) return notFound("Receipt not found");
    return ok(receipt);
  } catch (err) {
    console.error("GET /api/receipts/[id] failed:", err);
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const { id } = await params;
    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) return notFound("Receipt not found");

    const body = await request.json();
    const parsed = createExpenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        amount: parsed.amount,
        description: parsed.description,
        categoryId: parsed.categoryId,
        date: new Date(parsed.date),
        notes: parsed.notes,
        receiptId: id,
      },
      include: { category: true },
    });

    await prisma.receipt.update({
      where: { id },
      data: { status: "PARSED" },
    });

    return ok(expense);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("POST /api/receipts/[id]/expense failed:", err);
    return serverError();
  }
}
