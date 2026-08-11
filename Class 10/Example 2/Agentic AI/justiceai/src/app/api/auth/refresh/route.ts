import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, refreshTokens } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/tokens"
import { comparePassword } from "@/lib/auth/password"
import { COOKIE_ACCESS } from "@/lib/auth/cookies"

export async function GET(req: NextRequest) {
  try {
    const rawToken = req.cookies.get("lexcode_refresh")?.value

    if (!rawToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 })
    }

    const payload = await verifyRefreshToken(rawToken)

    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    const storedTokens = await db
      .select({
        id: refreshTokens.id,
        tokenHash: refreshTokens.tokenHash,
      })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, payload.userId),
          eq(refreshTokens.isRevoked, false)
        )
      )

    if (storedTokens.length === 0) {
      return NextResponse.json({ error: "Refresh token not recognized" }, { status: 401 })
    }

    let matched = false
    for (const stored of storedTokens) {
      const isValid = await comparePassword(rawToken, stored.tokenHash)
      if (isValid) {
        matched = true
        break
      }
    }

    if (!matched) {
      return NextResponse.json({ error: "Refresh token not recognized" }, { status: 401 })
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, role: users.role })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set(COOKIE_ACCESS, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 900,
    })

    return response
  } catch (err) {
    console.error("[REFRESH ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
