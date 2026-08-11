import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sessions, messages, users } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"
import { rateLimiter } from "@/lib/rate-limit"
import { streamWithFallback, MODEL_FOR_TOOL } from "@/lib/ai/models"
import { safeEnqueue, safeClose } from "@/lib/ai/stream-utils"
import { buildLegalMessages } from "@/lib/ai/legal-prompts"

const ChatSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(10000),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rateLimit = await rateLimiter(`chat:${session.userId}`, { max: 10, window: 60 })
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a moment before sending again." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  const body = await req.json()
  const parsed = ChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { sessionId, message: userMessage } = parsed.data

  const [chatSession] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, session.userId),
        eq(sessions.toolType, "legal")
      )
    )
    .limit(1)

  if (!chatSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  const userRole = user?.role ?? "both"

  await db.insert(messages).values({
    sessionId,
    userId: session.userId,
    role: "user",
    content: userMessage,
  })

  const history = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.createdAt))
    .limit(20)

  const aiMessages = buildLegalMessages(
    chatSession.contentSnapshot ?? "",
    history,
    userMessage,
    userRole
  )

  const encoder = new TextEncoder()
  let fullResponse = ""

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamWithFallback({
          messages: aiMessages,
          toolType: "legal",
          onChunk: (chunk) => {
            fullResponse += chunk
            safeEnqueue(
              controller,
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            )
          },
          onDone: async () => {
            await db.insert(messages).values({
              sessionId,
              userId: session.userId,
              role: "assistant",
              content: fullResponse,
              metadata: JSON.stringify({
                model: MODEL_FOR_TOOL.legal,
                timestamp: new Date().toISOString(),
              }),
            })

            await db
              .update(sessions)
              .set({
                messageCount: (chatSession.messageCount ?? 0) + 2,
                updatedAt: new Date(),
                ...(chatSession.title === "New Session"
                  ? {
                      title:
                        userMessage.slice(0, 60) +
                        (userMessage.length > 60 ? "..." : ""),
                    }
                  : {}),
              })
              .where(eq(sessions.id, sessionId))

            safeEnqueue(controller, encoder.encode("data: [DONE]\n\n"))
            safeClose(controller)
          },
          onError: (err) => {
            safeEnqueue(
              controller,
              encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`)
            )
            safeClose(controller)
          },
        })
      } catch (err) {
        console.error("[LEGAL CHAT ERROR]", err)
        safeEnqueue(
          controller,
          encoder.encode(`data: ${JSON.stringify({ error: "Stream failed unexpectedly" })}\n\n`)
        )
        safeClose(controller)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
