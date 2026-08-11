import OpenAI from "openai";
import { z } from "zod";

const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const TIMEOUT = Number(process.env.AGENT_TIMEOUT_MS) || 30_000;
const BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return null as unknown as OpenAI;
    client = new OpenAI({
      apiKey: key,
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Book Keeping",
      },
    });
  }
  return client;
}

function isConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

const ReceiptLineItem = z.object({
  description: z.string(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  totalPrice: z.number().positive(),
});

export const ReceiptParseResult = z.object({
  merchant: z.string(),
  date: z.string(),
  total: z.number().positive(),
  currency: z.string().default("USD"),
  lineItems: z.array(ReceiptLineItem).optional(),
  suggestedCategory: z.string().optional(),
});

export type ReceiptParseResult = z.infer<typeof ReceiptParseResult>;

export async function parseReceipt(ocrText: string): Promise<ReceiptParseResult> {
  const c = getClient();
  if (!c) throw new Error("Agent not configured — set OPENROUTER_API_KEY in .env");

  const completion = await c.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You parse receipt OCR text into structured JSON. " +
          "Extract merchant name, date, total, currency, line items, and suggest a spending category. " +
          "If a field is ambiguous, make your best guess and note it. " +
          "Never fabricate data that isn't in the text.\n\n" +
          "Respond with valid JSON matching this schema:\n" +
          JSON.stringify(ReceiptParseResult.shape, null, 2),
      },
      { role: "user", content: ocrText },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Agent returned empty parse result");

  return ReceiptParseResult.parse(JSON.parse(raw));
}

export const ConversationParseResult = z.object({
  action: z.enum(["create_expense", "create_income", "ask_clarification", "query", "other"]),
  expense: z
    .object({
      amount: z.number().positive().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      date: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  income: z
    .object({
      amount: z.number().positive().optional(),
      description: z.string().optional(),
      source: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
  clarification: z.string().optional(),
  response: z.string(),
});

export type ConversationParseResult = z.infer<typeof ConversationParseResult>;

export async function processConversation(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  categories: string[]
): Promise<ConversationParseResult> {
  const c = getClient();
  if (!c) {
    return {
      action: "other",
      response: "Agent is not configured. Please set OPENROUTER_API_KEY in your .env file.",
    };
  }

  const categoryList =
    categories.length > 0
      ? `Available categories: ${categories.join(", ")}`
      : "No categories defined yet.";

  const completion = await c.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are Ledger, a bookkeeping assistant. You help users track expenses conversationally.\n\n" +
          "When a user mentions a purchase or expense, extract structured data:\n" +
          "- amount: numeric value\n" +
          "- description: what they spent on\n" +
          "- category: match to one of the available categories\n" +
          "- date: when it happened (default to today if unclear)\n\n" +
          "For income (money received), set action=create_income and fill the income object (amount, description, source, date).\n" +
          "For expenses (money spent), set action=create_expense and fill the expense object (amount, description, category, date).\n" +
          "Rules:\n" +
          "- If required fields (amount, description) are missing, set action=ask_clarification and ask for what's missing.\n" +
          "- Never guess an amount. Never auto-create without amount + description.\n" +
          "- For general questions (\"how much did I spend last month\"), set action=query.\n" +
          "- Be concise and friendly.\n\n" +
          categoryList +
          "\n\nRespond with valid JSON matching this schema:\n" +
          JSON.stringify(ConversationParseResult.shape, null, 2),
      },
      ...history,
      { role: "user", content: message },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Agent returned empty conversation result");

  return ConversationParseResult.parse(JSON.parse(raw));
}
