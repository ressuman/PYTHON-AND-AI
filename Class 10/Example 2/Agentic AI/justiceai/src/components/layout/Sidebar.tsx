"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessions } from "@/hooks/useSessions";

interface SidebarProps {
  toolType: "legal" | "code";
  currentSessionId?: string;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

export function Sidebar({ toolType, currentSessionId }: SidebarProps) {
  const router = useRouter();
  const { sessions, isLoading, createSession } = useSessions(toolType);

  async function handleNewSession() {
    const session = await createSession();
    if (session) {
      router.push(`/dashboard/${toolType}/${session.id}`);
    }
  }

  const title = toolType === "legal" ? "⚖️ Legal Sessions" : "💻 Code Sessions";

  return (
    <div className="flex h-full w-[280px] flex-col overflow-y-auto border-r border-[#1E1E2E] bg-[#111118]">
      <div className="border-b border-[#1E1E2E] p-4">
        <h2 className="mb-4 text-sm font-medium text-gray-400">{title}</h2>
        <Button
          onClick={handleNewSession}
          className="w-full bg-primary hover:bg-primary-hover text-white"
        >
          + New Session
        </Button>
      </div>

      <div className="flex-1 p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-16 w-full bg-surface-2" />
            <Skeleton className="h-16 w-full bg-surface-2" />
            <Skeleton className="h-16 w-full bg-surface-2" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-gray-500">
            No sessions yet. Start a new one.
          </p>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => {
              const active = session.id === currentSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => router.push(`/dashboard/${toolType}/${session.id}`)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-l-2 border-primary bg-surface-2"
                      : "hover:bg-surface-2/50"
                  )}
                >
                  <p className={cn("truncate text-sm font-medium", active ? "text-text-primary" : "text-gray-400")}>
                    {truncate(session.title, 35)}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDate(session.createdAt)}</span>
                    {session.messageCount > 0 && (
                      <>
                        <span>&middot;</span>
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-gray-400">
                          {session.messageCount}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
