import { NextResponse } from "next/server"
import { generateGoogleAuthUrl } from "@/lib/auth/google"

export async function GET() {
  try {
    const state = crypto.randomUUID()
    const authUrl = generateGoogleAuthUrl(state)

    const response = NextResponse.redirect(authUrl)

    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    })

    return response
  } catch (err) {
    console.error("[GOOGLE AUTH ERROR]", err)
    return NextResponse.redirect(
      new URL("/auth/login?error=google_auth_failed", process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}
