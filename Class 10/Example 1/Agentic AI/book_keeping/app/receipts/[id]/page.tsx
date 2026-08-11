"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";

interface ReceiptDetail {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  status: "PENDING" | "PARSED" | "FAILED";
  errorMsg: string | null;
  parsedData: Record<string, unknown> | null;
  createdAt: string;
  expenses: { id: string; amount: number; description: string; date: string }[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReceiptDetailPage() {
  const params = useParams();
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof params.id === "string" ? params.id : params.id?.[0];
    if (!id) return;

    setLoading(true);
    fetch(`/api/receipts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Receipt not found");
        return r.json();
      })
      .then((d) => {
        setReceipt(d.data ?? d);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Receipt not found</h1>
        <p className="text-muted-foreground">{error ?? "This receipt does not exist."}</p>
        <Link href="/receipts">
          <Button variant="outline">Back to receipts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/receipts">
          <Button variant="ghost" size="sm">&larr; Back</Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{receipt.filename}</h1>
        <Badge>{receipt.status}</Badge>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="ml-auto">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Size:</strong> {formatBytes(receipt.size)}</p>
            <p><strong>Type:</strong> {receipt.mimeType}</p>
            <p><strong>Uploaded:</strong> {new Date(receipt.createdAt).toLocaleString()}</p>
            {receipt.errorMsg && (
              <p className="text-destructive"><strong>Error:</strong> {receipt.errorMsg}</p>
            )}
          </CardContent>
        </Card>

        {receipt.parsedData && (
          <Card>
            <CardHeader><CardTitle>Parsed Data</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded-md max-h-60 overflow-auto">
                {JSON.stringify(receipt.parsedData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {receipt.expenses.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Created Expenses ({receipt.expenses.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {receipt.expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-medium">${e.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
