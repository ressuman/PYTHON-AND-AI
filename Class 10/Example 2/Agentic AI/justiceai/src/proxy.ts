import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth/session"

const PROTECTED_PREFIXES = ["/dashboard", "/api/chat", "/api/sessions", "/api/documents"]
const AUTH_ROUTES = ["/auth/login", "/auth/signup"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  const session = await getSessionFromRequest(req)

  if (isProtected && !session) {
    const url = new URL("/auth/login", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (session) {
    const headers = new Headers(req.headers)
    headers.set("x-user-id", session.userId)
    headers.set("x-user-email", session.email)
    return NextResponse.next({ request: { headers } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/chat/:path*",
    "/api/sessions/:path*",
    "/api/documents/:path*",
  ],
}
