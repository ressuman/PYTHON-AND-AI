import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sessions, messages } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const [chatSession] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, session.userId)))
      .limit(1)

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const sessionMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt))

    return NextResponse.json({ session: chatSession, messages: sessionMessages })
  } catch (err) {
    console.error("[SESSION GET ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
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

    await db
      .update(sessions)
      .set({ isArchived: true })
      .where(eq(sessions.id, sessionId))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[SESSION DELETE ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}

const UpdateSessionSchema = z.object({
  title: z.string().max(255).optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
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
    const parsed = UpdateSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (parsed.data.title !== undefined) updates.title = parsed.data.title
    if (parsed.data.riskLevel !== undefined) updates.riskLevel = parsed.data.riskLevel

    const [updatedSession] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, sessionId))
      .returning()

    return NextResponse.json({ session: updatedSession })
  } catch (err) {
    console.error("[SESSION PATCH ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
