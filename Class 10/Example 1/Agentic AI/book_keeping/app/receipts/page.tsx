"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceiptUpload } from "@/components/receipt-upload";
import Link from "next/link";

interface Receipt {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  status: "PENDING" | "PARSED" | "FAILED";
  createdAt: string;
  errorMsg?: string;
  _count: { expenses: number };
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  PARSED: "default",
  FAILED: "destructive",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <Link href={`/receipts/${receipt.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate flex-1 mr-2">
              {receipt.filename}
            </CardTitle>
            <Badge variant={statusColors[receipt.status]}>{receipt.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>{formatBytes(receipt.size)}</p>
          <p>{new Date(receipt.createdAt).toLocaleDateString()}</p>
          {receipt.status === "PARSED" && (
            <p className="text-green-600 dark:text-green-400">{receipt._count.expenses} expense(s) created</p>
          )}
          {receipt.status === "FAILED" && receipt.errorMsg && (
            <p className="text-destructive truncate" title={receipt.errorMsg}>
              {receipt.errorMsg}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/receipts");
      if (!res.ok) throw new Error("Failed to load receipts");
      const data = await res.json();
      setReceipts(data.data ?? data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
      </div>

      <ReceiptUpload onUploaded={fetchReceipts} />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchReceipts}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && receipts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No receipts uploaded yet.</p>
            <p className="text-sm mt-1">Upload a receipt above to get started.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && receipts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {receipts.map((r) => (
            <ReceiptCard key={r.id} receipt={r} />
          ))}
        </div>
      )}
    </div>
  );
}
