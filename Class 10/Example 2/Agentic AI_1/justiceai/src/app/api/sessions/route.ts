import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sessions } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"

const SessionsQuerySchema = z.object({
  toolType: z.enum(["legal", "code"]).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const toolType = searchParams.get("toolType") as "legal" | "code" | null

    const validated = SessionsQuerySchema.safeParse({
      toolType: toolType === null ? undefined : toolType,
    })
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const query = db
      .select()
      .from(sessions)
      .where(
        validated.data.toolType
          ? and(
              eq(sessions.userId, session.userId),
              eq(sessions.isArchived, false),
              eq(sessions.toolType, validated.data.toolType)
            )
          : and(
              eq(sessions.userId, session.userId),
              eq(sessions.isArchived, false)
            )
      )
      .orderBy(desc(sessions.updatedAt))
      .limit(50)

    const userSessions = await query

    return NextResponse.json({ sessions: userSessions })
  } catch (err) {
    console.error("[SESSIONS GET ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}

const CreateSessionSchema = z.object({
  toolType: z.enum(["legal", "code"]),
  title: z.string().max(255).optional(),
  language: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = CreateSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { toolType, title, language } = parsed.data

    const [newSession] = await db
      .insert(sessions)
      .values({
        userId: session.userId,
        toolType,
        title: title ?? "New Session",
        language,
      })
      .returning()

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (err) {
    console.error("[SESSIONS POST ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
