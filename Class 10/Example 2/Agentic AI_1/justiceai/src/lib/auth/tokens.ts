import { SignJWT, jwtVerify } from "jose"

export interface AccessTokenPayload {
  userId: string
  email: string
  name: string
  role: string
  tokenType: "access"
}

export interface RefreshTokenPayload {
  userId: string
  tokenType: "refresh"
  rememberMe: boolean
}

const getAccessSecret = () => new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const getRefreshSecret = () => new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "tokenType">
): Promise<string> {
  return new SignJWT({ ...payload, tokenType: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessSecret())
}

export async function signRefreshToken(
  userId: string,
  rememberMe: boolean
): Promise<string> {
  const expiresIn = rememberMe ? "30d" : "7d"

  return new SignJWT({ userId, tokenType: "refresh", rememberMe })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getRefreshSecret())
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as unknown as AccessTokenPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    return payload as unknown as RefreshTokenPayload
  } catch {
    return null
  }
}
