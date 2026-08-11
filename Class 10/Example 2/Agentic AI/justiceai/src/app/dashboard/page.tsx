import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

const roleLabel: Record<string, string> = {
  lawyer: "Lawyer",
  engineer: "Engineer",
  general: "General User",
  admin: "Admin",
  both: "General User",
};

const roleColor: Record<string, string> = {
  lawyer: "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10",
  engineer: "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10",
  general: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
  admin: "text-primary border-primary/30 bg-primary/10",
  both: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const recentSessions = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      toolType: sessions.toolType,
      messageCount: sessions.messageCount,
      createdAt: sessions.createdAt,
    })
    .from(sessions)
    .where(eq(sessions.userId, session.userId))
    .orderBy(desc(sessions.createdAt))
    .limit(5);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, {session.name}
        </h1>
        <Badge
          variant="outline"
          className={`text-xs ${roleColor[session.role] ?? roleColor.both}`}
        >
          {roleLabel[session.role] ?? "General User"}
        </Badge>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-text-primary">Choose a Tool</h2>

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-[#8B5CF6] bg-[#111118] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-2xl">
            &#x2696;&#xFE0F;
          </div>
          <h3 className="mb-2 text-lg font-semibold text-text-primary">Legal Document Analyzer</h3>
          <p className="mb-6 text-sm text-gray-400 leading-relaxed">
            Upload contracts, leases, NDAs, and more for instant risk analysis
            and clause-by-clause breakdown in plain English.
          </p>
          <Link href="/dashboard/legal">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Start Analysis &rarr;
            </Button>
          </Link>
        </Card>

        <Card className="border-2 border-[#10B981] bg-[#111118] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 text-2xl">
            &#x1F4BB;
          </div>
          <h3 className="mb-2 text-lg font-semibold text-text-primary">AI Code Reviewer</h3>
          <p className="mb-6 text-sm text-gray-400 leading-relaxed">
            Paste any code for a security scan, bug detection, and performance
            review with explanations anyone can understand.
          </p>
          <Link href="/dashboard/code">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Review Code &rarr;
            </Button>
          </Link>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Sessions</h2>
      {recentSessions.length === 0 ? (
        <EmptyState
          icon="&#x1F4AD;"
          title="No sessions yet"
          description="Start a legal analysis or code review to see it here."
        />
      ) : (
        <div className="space-y-2">
          {recentSessions.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/${s.toolType}/${s.id}`}
              className="flex items-center justify-between rounded-lg border border-[#1E1E2E] bg-[#111118] p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {s.toolType === "legal" ? "\u2696\uFE0F" : "\uD83D\uDCBB"}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{s.title}</p>
                  <p className="text-xs text-gray-500">
                    {s.createdAt.toLocaleDateString()} &middot; {s.messageCount} messages
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 hover:text-text-primary">
                Open &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
