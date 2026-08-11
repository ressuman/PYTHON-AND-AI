import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sessions, messages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { ChatMessage } from "@/hooks/useChat";

export default async function CodeSessionPage({
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

  if (!found || found.toolType !== "code") {
    redirect("/dashboard/code");
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

  const codePreview = (found.contentSnapshot ?? "").split("\n")[0].slice(0, 80);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar toolType="code" currentSessionId={sessionId} />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1E1E2E] bg-[#111118] px-6 py-3">
          <div className="flex items-center gap-3">
            {found.language && (
              <span className="rounded bg-[#10B981]/10 px-2 py-0.5 text-xs text-[#10B981]">
                {found.language}
              </span>
            )}
            <span className="truncate text-sm text-gray-400">{codePreview}</span>
          </div>
          <Link href="/dashboard/code">
            <Button variant="outline" size="sm" className="text-gray-400">
              + New Review
            </Button>
          </Link>
        </div>

        <ChatWindow
          sessionId={sessionId}
          toolType="code"
          initialMessages={chatMessages}
        />
      </main>
    </div>
  );
}
