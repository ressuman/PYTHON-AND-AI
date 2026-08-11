import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users, refreshTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { comparePassword, hashPassword } from "@/lib/auth/password"
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens"
import { setAuthCookies } from "@/lib/auth/cookies"
import { verifyRecaptcha } from "@/lib/auth/recaptcha"

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
  recaptchaToken: z.string().min(1, "Security check required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password, rememberMe, recaptchaToken } = parsed.data

    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: "Security check failed. Please try again." },
        { status: 400 }
      )
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      )
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const rawRefreshToken = await signRefreshToken(user.id, rememberMe)

    const tokenHash = await hashPassword(rawRefreshToken)
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 86400000)

    await db
      .insert(refreshTokens)
      .values({ userId: user.id, tokenHash, expiresAt, isRevoked: false })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    setAuthCookies(response, accessToken, rawRefreshToken, rememberMe)

    return response
  } catch (err) {
    console.error("[LOGIN ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
