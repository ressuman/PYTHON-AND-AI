import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Navbar user={user} />
      <div className="flex flex-1 overflow-hidden pt-[60px]">{children}</div>
    </div>
  );
}
