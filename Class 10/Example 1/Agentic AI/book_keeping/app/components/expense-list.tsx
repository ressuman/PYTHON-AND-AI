"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExpenseDialog } from "@/components/expense-dialog";

type Category = { id: string; name: string; color: string | null; icon: string | null };
type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string;
  notes: string | null;
  categoryId: string;
  category: Category;
  receiptId: string | null;
};

export function ExpenseList({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: Category[];
}) {
  const router = useRouter();
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Expense deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete expense");
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditExpense(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <p className="text-lg">No expenses recorded yet.</p>
          <p className="text-sm mt-1">Click &quot;Add Expense&quot; to get started.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: e.category.color ?? "#6b7280", color: "#fff" }}
                    >
                      {e.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${e.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditExpense(e); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editExpense}
        categories={categories}
      />
    </>
  );
}
