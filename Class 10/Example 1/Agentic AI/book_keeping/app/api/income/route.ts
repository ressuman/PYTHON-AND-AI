import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createIncomeSchema } from "@/lib/schemas";
import { ok, created, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return ok(incomes);
  } catch (err) {
    console.error("GET /api/income failed:", err);
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
    const parsed = createIncomeSchema.parse(body);

    const income = await prisma.income.create({
      data: {
        amount: parsed.amount,
        description: parsed.description,
        source: parsed.source,
        date: new Date(parsed.date),
        notes: parsed.notes,
      },
    });

    return created(income);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("POST /api/income failed:", err);
    return serverError();
  }
}
