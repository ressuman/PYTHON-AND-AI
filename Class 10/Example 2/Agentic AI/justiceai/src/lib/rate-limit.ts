import { redis } from "./redis"

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimiter(
  identifier: string,
  options: { max: number; window: number }
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - options.window

  try {
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    pipeline.zcard(key)
    pipeline.expire(key, options.window)
    const results = await pipeline.exec()

    const count = results[2] as number

    return {
      success: count <= options.max,
      remaining: Math.max(0, options.max - count),
      reset: now + options.window,
    }
  } catch (err) {
    console.error("[RATE LIMIT ERROR]", err)
    return { success: true, remaining: options.max, reset: now + options.window }
  }
}
