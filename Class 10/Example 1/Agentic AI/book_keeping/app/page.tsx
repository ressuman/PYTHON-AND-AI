import { prisma } from "@/lib/db";
import { DollarSign, Receipt, TrendingUp, AlertTriangle, ArrowUpCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentExpenses } from "@/components/recent-expenses";
import { SpendingChart } from "@/components/spending-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { IncomeExpenseChart } from "@/components/income-expense-chart";

async function getStats() {
  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({ include: { category: true }, orderBy: { date: "desc" } }),
    prisma.income.findMany({ orderBy: { date: "desc" } }),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const expenseCount = expenses.length;
  const incomeCount = incomes.length;
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  // Expense by category
  const byCategory: Record<string, { name: string; color: string; total: number; count: number }> = {};
  for (const e of expenses) {
    const key = e.category.name;
    if (!byCategory[key]) {
      byCategory[key] = { name: key, color: e.category.color ?? "#6b7280", total: 0, count: 0 };
    }
    byCategory[key].total += Number(e.amount);
    byCategory[key].count++;
  }
  const topCategory = Object.values(byCategory).sort((a, b) => b.total - a.total)[0];

  // Monthly aggregation
  const byMonth: Record<string, { income: number; expense: number }> = {};
  for (const e of expenses) {
    const key = e.date.toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
    byMonth[key].expense += Number(e.amount);
  }
  for (const i of incomes) {
    const key = i.date.toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
    byMonth[key].income += Number(i.amount);
  }
  const monthlyData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { income, expense }]) => ({ month, income, expense }));

  const categoryData = Object.values(byCategory)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ name: c.name, value: c.total, color: c.color }));

  return {
    totalExpenses,
    totalIncome,
    netIncome: totalIncome - totalExpenses,
    expenseCount,
    incomeCount,
    avgExpense,
    topCategory,
    recent: expenses.slice(0, 5),
    monthlyData,
    categoryData,
  };
}

export default async function Dashboard() {
  const s = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${s.totalIncome.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">{s.incomeCount} entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${s.totalExpenses.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{s.expenseCount} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${s.netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600"}`}>
              ${s.netIncome.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">{s.netIncome >= 0 ? "Surplus" : "Deficit"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg / Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${s.avgExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold truncate">
              {s.topCategory ? s.topCategory.name : "\u2014"}
            </p>
            <p className="text-xs text-muted-foreground">
              {s.topCategory ? `$${s.topCategory.total.toFixed(2)}` : "No expenses yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <IncomeExpenseChart data={s.monthlyData} />
        <CategoryPieChart data={s.categoryData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentExpenses expenses={s.recent} />
        </CardContent>
      </Card>
    </div>
  );
}
