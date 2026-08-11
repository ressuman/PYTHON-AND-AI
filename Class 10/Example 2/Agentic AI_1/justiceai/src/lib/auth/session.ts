import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { verifyAccessToken, type AccessTokenPayload } from "./tokens"
import { COOKIE_ACCESS } from "./cookies"

export async function getSession(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_ACCESS)?.value

  if (!token) return null

  return verifyAccessToken(token)
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<AccessTokenPayload | null> {
  const token = req.cookies.get(COOKIE_ACCESS)?.value

  if (!token) return null

  return verifyAccessToken(token)
}
