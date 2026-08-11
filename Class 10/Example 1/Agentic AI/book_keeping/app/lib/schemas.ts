import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive").multipleOf(0.01),
  description: z.string().min(1, "Description is required").max(500),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
  receiptId: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const createIncomeSchema = z.object({
  amount: z.number().positive("Amount must be positive").multipleOf(0.01),
  description: z.string().min(1, "Description is required").max(500),
  source: z.string().max(200).optional(),
  date: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color").optional(),
  icon: z.string().max(50).optional(),
});

export const sessionMetadataSchema = z.object({
  title: z.string().max(200).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().nullable().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
