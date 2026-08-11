import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { refreshTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"
import { clearAuthCookies } from "@/lib/auth/cookies"

export async function POST() {
  try {
    const session = await getSession()

    if (session) {
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.userId, session.userId))
    }

    const response = NextResponse.json({ success: true })
    clearAuthCookies(response)
    return response
  } catch (err) {
    console.error("[LOGOUT ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
