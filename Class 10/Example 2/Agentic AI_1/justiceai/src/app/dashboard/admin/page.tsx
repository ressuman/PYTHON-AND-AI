import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, sessions, messages, documents } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const [userCount] = await db
    .select({ value: count() })
    .from(users);

  const [sessionCount] = await db
    .select({ value: count() })
    .from(sessions);

  const [messageCount] = await db
    .select({ value: count() })
    .from(messages);

  const [documentCount] = await db
    .select({ value: count() })
    .from(documents);

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  const userSessionCounts = await Promise.all(
    allUsers.map(async (u) => {
      const [result] = await db
        .select({ value: count() })
        .from(sessions)
        .where(eq(sessions.userId, u.id));
      return { userId: u.id, count: result.value };
    })
  );

  const countMap = Object.fromEntries(
    userSessionCounts.map((x) => [x.userId, x.count])
  );

  const stats = [
    { label: "Total Users", value: userCount.value, color: "text-primary" },
    { label: "Total Sessions", value: sessionCount.value, color: "text-legal-accent" },
    { label: "Total Messages", value: messageCount.value, color: "text-code-accent" },
    { label: "Documents Uploaded", value: documentCount.value, color: "text-general-accent" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Admin Panel</h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-surface border-border p-6">
            <p className="text-sm text-text-muted mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Users</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Active</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((u) => (
                <tr key={u.id} className="text-text-primary hover:bg-surface/50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <span className="text-[#10B981]">Active</span>
                    ) : (
                      <span className="text-danger">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {u.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {countMap[u.id] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
