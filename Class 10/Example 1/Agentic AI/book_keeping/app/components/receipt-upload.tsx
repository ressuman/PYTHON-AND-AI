"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Loader2 } from "lucide-react";

interface ReceiptUploadProps {
  onUploaded: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function ReceiptUpload({ onUploaded }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Only JPEG, PNG, WebP, and PDF files are accepted.");
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }

    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }

      setFile(null);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            onChange={handleSelect}
          />

          {!file ? (
            <div
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Click to upload a receipt</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, or PDF (max 10 MB)</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <File className="h-8 w-8 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          {file && (
            <Button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto">
              {uploading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Parsing receipt...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Upload & Parse</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
