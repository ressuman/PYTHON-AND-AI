import { hashPassword } from "./password"
import { signAccessToken, signRefreshToken } from "./tokens"
import { db } from "@/lib/db"
import { users, refreshTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth"

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

export function generateGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  })

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<{ access_token: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status}`)
  }

  return res.json() as Promise<{ access_token: string }>
}

export async function fetchGoogleUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch Google user")
  }

  return res.json() as Promise<GoogleUser>
}

export async function handleGoogleCallback(code: string): Promise<{
  accessToken: string
  refreshToken: string
  user: { id: string; name: string; email: string; role: string }
}> {
  const tokens = await exchangeCodeForTokens(code)
  const googleUser = await fetchGoogleUser(tokens.access_token)

  if (!googleUser.verified_email) {
    throw new Error("Google email not verified")
  }

  const [existingUser] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, googleUser.email))
    .limit(1)

  let user: { id: string; name: string; email: string; role: string }

  if (existingUser) {
    user = existingUser
  } else {
    const passwordHash = await hashPassword(crypto.randomUUID())

    const [newUser] = await db
      .insert(users)
      .values({
        name: googleUser.name,
        email: googleUser.email,
        passwordHash,
        role: "both",
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role })

    user = newUser
  }

  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const rawRefreshToken = await signRefreshToken(user.id, false)

  const tokenHash = await hashPassword(rawRefreshToken)
  const expiresAt = new Date(Date.now() + 7 * 86400000)

  await db
    .insert(refreshTokens)
    .values({ userId: user.id, tokenHash, expiresAt, isRevoked: false })

  return { accessToken, refreshToken: rawRefreshToken, user }
}
