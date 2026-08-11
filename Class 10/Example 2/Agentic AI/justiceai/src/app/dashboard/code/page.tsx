"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { LanguageSelector } from "@/components/code/LanguageSelector";
import { CodeEditor } from "@/components/code/CodeEditor";
import { useSessions } from "@/hooks/useSessions";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CodePage() {
  const router = useRouter();
  const { createSession } = useSessions("code");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReview() {
    if (!code.trim()) return;
    setIsSubmitting(true);

    const newSession = await createSession("Code Review", language);
    if (!newSession) {
      setIsSubmitting(false);
      return;
    }

    await fetch(`/api/sessions/${newSession.id}/content`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentSnapshot: code,
        language,
      }),
    });

    router.push(`/dashboard/code/${newSession.id}`);
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar toolType="code" />

      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          &#x1F4BB; AI Code Reviewer
        </h1>
        <p className="mb-8 text-gray-400">
          Paste your code for expert security and quality review.
        </p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Language
          </label>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        <CodeEditor value={code} onChange={setCode} language={language} />

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleReview}
            disabled={!code.trim() || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : "Review My Code →"}
          </Button>
        </div>
      </main>
    </div>
  );
}
