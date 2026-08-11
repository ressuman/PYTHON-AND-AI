"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer } from "lucide-react";

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeCount: number;
  expenseCount: number;
  topExpenseCategory: { name: string; total: number } | null;
  incomeBySource: { source: string; total: number }[];
  expensesByCategory: { name: string; total: number; color: string }[];
}

export default function ReportsPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [from, setFrom] = useState(firstDay.toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      const [incRes, expRes] = await Promise.all([
        fetch(`/api/income?${params}`),
        fetch(`/api/expenses?${params}`),
      ]);

      const incData = await incRes.json();
      const expData = await expRes.json();
      const incomes = incData.data ?? incData;
      const expenses = expData.data ?? expData;

      const totalIncome = incomes.reduce((s: number, i: { amount: number }) => s + Number(i.amount), 0);
      const totalExpenses = expenses.reduce((s: number, e: { amount: number }) => s + Number(e.amount), 0);

      const bySource: Record<string, number> = {};
      for (const i of incomes) {
        const src = i.source || "Other";
        bySource[src] = (bySource[src] ?? 0) + Number(i.amount);
      }

      const byCategory: Record<string, { name: string; total: number; color: string }> = {};
      for (const e of expenses) {
        const key = e.category?.name ?? "Uncategorized";
        if (!byCategory[key]) {
          byCategory[key] = { name: key, total: 0, color: e.category?.color ?? "#6b7280" };
        }
        byCategory[key].total += Number(e.amount);
      }

      const sortedCats = Object.values(byCategory).sort((a, b) => b.total - a.total);

      setSummary({
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        incomeCount: incomes.length,
        expenseCount: expenses.length,
        topExpenseCategory: sortedCats[0] ? { name: sortedCats[0].name, total: sortedCats[0].total } : null,
        incomeBySource: Object.entries(bySource).map(([source, total]) => ({ source, total })),
        expensesByCategory: sortedCats,
      });
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm">From:</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">To:</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <Button size="sm" onClick={fetchSummary}>Update</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-24" /></CardContent></Card>
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Income</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{summary.incomeCount} entries</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Expenses</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{summary.expenseCount} entries</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Net</CardTitle></CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${summary.netIncome.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.netIncome >= 0 ? "Surplus" : "Deficit"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Income by Source</CardTitle></CardHeader>
              <CardContent>
                {summary.incomeBySource.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No income data</p>
                ) : (
                  <div className="space-y-2">
                    {summary.incomeBySource.map((s) => (
                      <div key={s.source} className="flex items-center justify-between text-sm">
                        <span>{s.source}</span>
                        <span className="font-medium">${s.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
              <CardContent>
                {summary.expensesByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No expense data</p>
                ) : (
                  <div className="space-y-2">
                    {summary.expensesByCategory.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </div>
                        <span className="font-medium">${c.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {summary.topExpenseCategory && (
            <Card className="print:break-inside-avoid">
              <CardHeader><CardTitle>Top Spending Category</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{summary.topExpenseCategory.name}</p>
                <p className="text-muted-foreground">${summary.topExpenseCategory.total.toFixed(2)}</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
