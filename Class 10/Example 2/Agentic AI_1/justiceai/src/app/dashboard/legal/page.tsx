"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentUploader } from "@/components/legal/DocumentUploader";
import { useSessions } from "@/hooks/useSessions";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function LegalPage() {
  const router = useRouter();
  const { createSession } = useSessions("legal");
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  async function handleUploadComplete(fileUrl: string, fileName: string, fileKey: string, fileSize: number) {
    const newSession = await createSession(fileName.slice(0, 60) || "Legal Document");
    if (!newSession) return;

    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: newSession.id,
        fileName,
        fileUrl,
        fileKey,
        fileSize,
      }),
    });

    router.push(`/dashboard/legal/${newSession.id}`);
  }

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed) return;

    setIsAsking(true);
    const newSession = await createSession("Legal Question");
    setIsAsking(false);

    if (newSession) {
      router.push(`/dashboard/legal/${newSession.id}`);
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar toolType="legal" />

      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          &#x2696;&#xFE0F; Legal Document Analyzer
        </h1>
        <p className="mb-8 text-gray-400">
          Upload a contract, lease, or any legal document for instant AI analysis.
        </p>

        <DocumentUploader onUploadComplete={handleUploadComplete} />

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#1E1E2E]" />
          <span className="text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-[#1E1E2E]" />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">
            Have a legal question? Ask directly
          </h2>
          <div className="relative">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
              placeholder="e.g. What should I check before signing an NDA?"
              className="bg-[#111118] border-[#1E1E2E] pr-20 text-text-primary"
            />
            <Button
              onClick={handleAsk}
              disabled={!question.trim() || isAsking}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              {isAsking ? <LoadingSpinner size="sm" /> : "Ask"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
