import { NextRequest, NextResponse } from "next/server"
import { handleGoogleCallback } from "@/lib/auth/google"
import { setAuthCookies } from "@/lib/auth/cookies"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        new URL("/auth/login?error=google_denied", req.url)
      )
    }

    const storedState = req.cookies.get("google_oauth_state")?.value

    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL("/auth/login?error=state_mismatch", req.url)
      )
    }

    const response = NextResponse.redirect(new URL("/dashboard", req.url))
    response.cookies.set("google_oauth_state", "", { maxAge: 0 })

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_request", req.url)
      )
    }

    const { accessToken, refreshToken, user: _user } = await handleGoogleCallback(code)

    setAuthCookies(response, accessToken, refreshToken, false)

    return response
  } catch (err) {
    console.error("[GOOGLE CALLBACK ERROR]", err)
    return NextResponse.redirect(
      new URL("/auth/login?error=google_auth_failed", req.url)
    )
  }
}
