import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users, refreshTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { hashPassword } from "@/lib/auth/password"
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens"
import { setAuthCookies } from "@/lib/auth/cookies"
import { verifyRecaptcha } from "@/lib/auth/recaptcha"

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  role: z.enum(["lawyer", "engineer", "general", "both"]).default("both"),
  recaptchaToken: z.string().min(1, "Security check required"),
  rememberMe: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = SignupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password, role, recaptchaToken, rememberMe } = parsed.data

    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: "Security check failed. Please try again." },
        { status: 400 }
      )
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, role })
      .returning({ id: users.id, email: users.email, name: users.name, role: users.role })

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

    const response = NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    )

    setAuthCookies(response, accessToken, rawRefreshToken, rememberMe)

    return response
  } catch (err) {
    console.error("[SIGNUP ERROR]", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
