"use client"

import { useEffect, useRef } from "react"
import { useChat, UIChatMessage } from "@/hooks/useChat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import TypingIndicator from "./TypingIndicator"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorBanner } from "@/components/shared/ErrorBanner"

interface ChatWindowProps {
  sessionId: string
  toolType: "legal" | "code"
  initialMessages: UIChatMessage[]
}

export function ChatWindow({ sessionId, toolType, initialMessages }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage, stopGeneration, clearError } = useChat({
    sessionId, toolType, initialMessages
  })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        {messages.length === 0 && !isLoading && (
          <EmptyState
            icon={toolType === "legal" ? "⚖️" : "💻"}
            title={toolType === "legal" ? "Start your legal analysis" : "Start your code review"}
            description={toolType === "legal"
              ? "Ask a question or upload a document to begin"
              : "Paste your code above or ask a coding question"}
          />
        )}
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1
          const isStreamingThis = isLast && isLoading && message.role === "assistant"
          return <ChatMessage key={message.id} message={message} isStreaming={isStreamingThis} />
        })}
        <div ref={bottomRef} />
      </ScrollArea>
      <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
    </div>
  )
}
