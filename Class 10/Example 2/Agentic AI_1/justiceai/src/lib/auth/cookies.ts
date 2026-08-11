import { NextResponse, NextRequest } from "next/server"

export const COOKIE_ACCESS = "lexcode_access"
export const COOKIE_REFRESH = "lexcode_refresh"

const isProd = process.env.NODE_ENV === "production"

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean
): void {
  response.cookies.set(COOKIE_ACCESS, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 900,
  })

  response.cookies.set(COOKIE_REFRESH, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: rememberMe ? 2592000 : 604800,
  })
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(COOKIE_ACCESS, "", { maxAge: 0 })
  response.cookies.set(COOKIE_REFRESH, "", { maxAge: 0 })
}

export function getAccessToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_ACCESS)?.value
}

export function getRefreshToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_REFRESH)?.value
}
