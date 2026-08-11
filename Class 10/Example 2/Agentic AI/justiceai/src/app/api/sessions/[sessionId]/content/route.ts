import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sessions, documents } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

const UpdateContentSchema = z.object({
  contentSnapshot: z.string().max(100000),
  language: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const [chatSession] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, session.userId)))
      .limit(1)

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = UpdateContentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {
      contentSnapshot: parsed.data.contentSnapshot,
      updatedAt: new Date(),
    }
    if (parsed.data.language !== undefined) updates.language = parsed.data.language

    await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, sessionId))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[SESSION CONTENT PATCH ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
