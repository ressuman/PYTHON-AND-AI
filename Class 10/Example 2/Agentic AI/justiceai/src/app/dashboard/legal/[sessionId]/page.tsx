import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sessions, messages, documents } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentUploader } from "@/components/legal/DocumentUploader";
import { RiskBadge } from "@/components/legal/RiskBadge";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { ChatMessage } from "@/hooks/useChat";

export default async function LegalSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { sessionId } = await params;

  const [found] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, session.userId)));

  if (!found || found.toolType !== "legal") {
    redirect("/dashboard/legal");
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(and(eq(messages.sessionId, sessionId), eq(messages.userId, session.userId)))
    .orderBy(asc(messages.createdAt));

  const chatMessages: ChatMessage[] = msgs.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    createdAt: m.createdAt,
  }));

  async function handleUploadComplete(fileUrl: string, fileName: string, fileKey: string, fileSize: number) {
    "use server";

    const currentSession = await getSession();
    if (!currentSession) return;

    await db.insert(documents).values({
      sessionId,
      userId: currentSession.userId,
      fileName,
      fileUrl,
      fileKey,
      fileSize,
    });

    await db
      .update(sessions)
      .set({
        documentUrl: fileUrl,
        documentName: fileName,
        documentType: fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));

    revalidatePath(`/dashboard/legal/${sessionId}`);
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar toolType="legal" currentSessionId={sessionId} />

      <main className="flex flex-1 flex-col overflow-hidden">
        {found.documentUrl ? (
          <div className="flex items-center justify-between border-b border-[#1E1E2E] bg-[#111118] px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">&#x1F4C4;</span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {found.documentName ?? "Document"}
                </p>
                {found.riskLevel && <RiskBadge level={found.riskLevel} />}
              </div>
            </div>
            <a
              href={found.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Document
            </a>
          </div>
        ) : (
          <div className="border-b border-[#1E1E2E] bg-[#111118] px-6 py-4">
            <p className="mb-3 text-sm text-gray-400">
              No document uploaded yet. Upload one to analyze.
            </p>
            <DocumentUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}

        <ChatWindow
          sessionId={sessionId}
          toolType="legal"
          initialMessages={chatMessages}
        />
      </main>
    </div>
  );
}
