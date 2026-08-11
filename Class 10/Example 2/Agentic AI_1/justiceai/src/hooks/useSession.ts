"use client"

import { useState, useEffect } from "react"
import { UserProfile } from "@/types/index"

export function useSession() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json() as { user: UserProfile }
          if (!cancelled) {
            setUser(data.user)
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchSession()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
  }
}
