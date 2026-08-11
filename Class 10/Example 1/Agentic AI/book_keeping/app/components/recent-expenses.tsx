import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RecentExpense = {
  id: string;
  amount: { toString: () => string };
  description: string;
  date: Date;
  category: { name: string; color: string | null };
};

export function RecentExpenses({ expenses }: { expenses: RecentExpense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No expenses yet.</p>
        <Link href="/expenses" className="text-sm text-primary underline underline-offset-4 mt-2 inline-block">
          Add your first expense
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="text-muted-foreground">
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
              ${Number(e.amount).toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
