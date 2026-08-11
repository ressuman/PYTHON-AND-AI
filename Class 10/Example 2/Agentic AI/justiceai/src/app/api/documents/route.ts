import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sessions, documents } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"

const CreateDocumentSchema = z.object({
  sessionId: z.string().uuid(),
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileKey: z.string(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = CreateDocumentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { sessionId, fileName, fileUrl, fileKey, fileSize, mimeType } = parsed.data

    const [chatSession] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, session.userId)))
      .limit(1)

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const [document] = await db
      .insert(documents)
      .values({
        sessionId,
        userId: session.userId,
        fileName,
        fileUrl,
        fileKey,
        fileSize,
        mimeType,
      })
      .returning()

    const documentType = mimeType?.includes("pdf") ? "pdf" : "docx"

    await db
      .update(sessions)
      .set({
        documentUrl: fileUrl,
        documentName: fileName,
        documentType,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId))

    return NextResponse.json({ document }, { status: 201 })
  } catch (err) {
    console.error("[DOCUMENTS POST ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
