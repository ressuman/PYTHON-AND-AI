"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";

interface DocumentUploaderProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileKey: string, fileSize: number) => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full">
      <UploadDropzone
        endpoint="legalDocumentUploader"
        onClientUploadComplete={(res) => {
          setError(null);
          if (!res?.[0]) return;
          const file = res[0];
          onUploadComplete(file.url, file.name, file.key, file.size);
        }}
        onUploadError={(err: Error) => {
          setError(err.message);
        }}
        config={{ mode: "auto" }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-[#8B5CF6] bg-[#111118] p-8 transition-colors hover:bg-[#15151f] ut-button:bg-indigo-600 ut-button:ut-ready:bg-indigo-600"
        appearance={{
          container: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            textAlign: "center",
          },
          uploadIcon: {
            fontSize: "2.5rem",
          },
          label: {
            color: "#f8f8ff",
            fontWeight: 500,
          },
          allowedContent: {
            color: "#9ca3af",
          },
          button: {
            background: "#6366f1",
          },
        }}
        content={{
          uploadIcon: "⚖️",
          label: "Drop your PDF or DOCX here",
          allowedContent: "PDF, DOCX — Max 16MB",
        }}
      />
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
