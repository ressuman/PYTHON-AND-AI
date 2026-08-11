"use client"

import { useState, useRef, useCallback } from "react"

export interface UIChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date | string
}

export type ChatMessage = UIChatMessage

interface UseChatOptions {
  sessionId: string
  toolType: "legal" | "code"
  initialMessages?: UIChatMessage[]
}

export function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<UIChatMessage[]>(options.initialMessages ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      const userMsg: UIChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      const aiId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: "assistant", content: "", createdAt: new Date() },
      ])

      abortControllerRef.current = new AbortController()

      try {
        const res = await fetch(`/api/chat/${options.toolType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: options.sessionId, message: content }),
          signal: abortControllerRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        if (!res.body) throw new Error("No stream body")

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data) as { content?: string; error?: string }
              if (parsed.error) {
                setError(parsed.error)
                setMessages((prev) => prev.filter((m) => m.id !== aiId))
                break
              }
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, content: m.content + parsed.content } : m
                  )
                )
              }
            } catch {
              continue
            }
          }
        }
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string }
        if (e.name === "AbortError") return
        const message = e.message ?? "Something went wrong"
        setError(message)
        setMessages((prev) => prev.filter((m) => m.id !== aiId))
      } finally {
        setIsLoading(false)
      }
    },
    [options.sessionId, options.toolType, isLoading]
  )

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearError,
    setMessages,
  }
}
