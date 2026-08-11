import { NextRequest } from "next/server";
import { Prisma } from "@/lib/generated";
import { prisma } from "@/lib/db";
import { chatMessageSchema } from "@/lib/schemas";
import { processConversation } from "@/lib/agent";
import { ok, badRequest, serverError, handleZodError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const body = await request.json();
    const parsed = chatMessageSchema.parse(body);

    const categories = await prisma.category.findMany({ select: { name: true } });
    const categoryNames = categories.map((c) => c.name);

    let history: { role: "user" | "assistant"; content: string }[] = [];

    if (parsed.sessionId) {
      const session = await prisma.session.findUnique({ where: { id: parsed.sessionId } });
      if (session) {
        const messages = (session.messages as { role: string; content: string }[]) ?? [];
        history = messages.slice(-20).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      }
    }

    const result = await processConversation(parsed.message, history, categoryNames);

    let sessionId = parsed.sessionId;

    if (!sessionId) {
      const session = await prisma.session.create({
        data: {
          messages: [] as unknown as Prisma.InputJsonValue,
        },
      });
      sessionId = session.id;
    }

    const prev = await prisma.session.findUnique({ where: { id: sessionId } });
    const existingMessages = (prev?.messages as { role: string; content: string }[]) ?? [];
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        messages: [
          ...existingMessages,
          { role: "user", content: parsed.message },
          { role: "assistant", content: result.response },
        ] as unknown as Prisma.InputJsonValue,
        title: existingMessages.length === 0 ? parsed.message.slice(0, 100) : undefined,
      },
    });

    if (result.action === "create_expense" && result.expense?.amount && result.expense?.description) {
      const category = result.expense.category
        ? await prisma.category.findFirst({ where: { name: { mode: "insensitive", equals: result.expense.category } } })
        : null;

      try {
        await prisma.expense.create({
          data: {
            amount: result.expense.amount,
            description: result.expense.description,
            categoryId: category?.id ?? categoryNames[0] ?? "uncategorized",
            date: result.expense.date ? new Date(result.expense.date) : new Date(),
            notes: result.expense.notes,
          },
        });
      } catch (err) {
        console.error("Failed to auto-create expense from chat:", err);
      }
    }

    if (result.action === "create_income" && result.income?.amount && result.income?.description) {
      try {
        await prisma.income.create({
          data: {
            amount: result.income.amount,
            description: result.income.description,
            source: result.income.source,
            date: result.income.date ? new Date(result.income.date) : new Date(),
          },
        });
      } catch (err) {
        console.error("Failed to auto-create income from chat:", err);
      }
    }

    return ok({ ...result, sessionId });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    console.error("POST /api/chat failed:", err);
    return serverError();
  }
}
