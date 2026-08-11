"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatSession } from "@/types/index"

export function useSessions(toolType: "legal" | "code") {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sessions?toolType=${toolType}`)
      if (!res.ok) throw new Error("Failed to fetch sessions")
      const data = await res.json() as { sessions: ChatSession[] }
      setSessions(data.sessions ?? [])
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message ?? "Failed to load sessions")
    } finally {
      setIsLoading(false)
    }
  }, [toolType])

  useEffect(() => {
    refreshSessions()
  }, [refreshSessions])

  const createSession = useCallback(
    async (title?: string, language?: string): Promise<ChatSession | null> => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolType, title, language }),
        })
        if (!res.ok) throw new Error("Failed to create session")
        const data = await res.json() as { session: ChatSession }
        setSessions((prev) => [data.session, ...prev])
        return data.session
      } catch {
        return null
      }
    },
    [toolType]
  )

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete session")
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch {
      // silently fail
    }
  }, [])

  return {
    sessions,
    isLoading,
    error,
    createSession,
    deleteSession,
    refreshSessions,
  } as const
}
