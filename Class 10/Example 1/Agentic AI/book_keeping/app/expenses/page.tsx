import { prisma } from "@/lib/db";
import { ExpenseList } from "@/components/expense-list";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [expenses, categories] = await Promise.all([
    prisma.expense.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = expenses.map((e) => ({
    ...e,
    amount: Number(e.amount),
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    category: {
      ...e.category,
      color: e.category.color ?? "#6b7280",
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
      </div>
      <ExpenseList expenses={serialized} categories={categories} />
    </div>
  );
}
