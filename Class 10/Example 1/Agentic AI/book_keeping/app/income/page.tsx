"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowUpCircle, X } from "lucide-react";

interface Income {
  id: string;
  amount: number;
  description: string;
  source: string | null;
  date: string;
  notes: string | null;
  createdAt: string;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/income");
      if (!res.ok) throw new Error("Failed to load income");
      const data = await res.json();
      setIncomes(data.data ?? data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load income");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    setSaving(true);

    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsed,
          description,
          source: source || undefined,
          date: new Date(date).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setAmount("");
      setDescription("");
      setSource("");
      setDate(new Date().toISOString().slice(0, 10));
      setShowForm(false);
      fetchIncomes();
    } catch {
      setError("Failed to save income");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Income</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4 mr-2" /> Cancel</> : <><Plus className="h-4 w-4 mr-2" /> Add Income</>}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${total.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{incomes.length} entries</p>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Income Entry</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="e.g. Freelance payment, Salary, Gift"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Source (optional)</label>
                  <Input
                    placeholder="e.g. Client name, Employer, etc."
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Income"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchIncomes}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && incomes.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <ArrowUpCircle className="h-10 w-10 mx-auto mb-2" />
            <p>No income recorded yet.</p>
            <p className="text-sm mt-1">Add your first income entry above.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && incomes.length > 0 && (
        <div className="divide-y">
          {incomes.map((inc) => (
            <div key={inc.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{inc.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(inc.date).toLocaleDateString()}
                  {inc.source && ` — ${inc.source}`}
                </p>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                +${Number(inc.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
