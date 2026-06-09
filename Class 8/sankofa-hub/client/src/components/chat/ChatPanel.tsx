import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@/hooks/useChat'
import { useHealthCheck } from '@/hooks/useHealthCheck'
import { useChatStore } from '@/stores/chatStore'
import { chatPanelVariants } from '@/lib/animations'
import { ChatHeader } from './ChatHeader'
import { ChatMessage } from './ChatMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { cn } from '@/lib/utils'

export function ChatPanel() {
  const {
    messages,
    loadingState,
    sendMessage,
    resetChat,
    canSend,
  } = useChat()

  const { isHealthy, isChecking } = useHealthCheck()
  const { closeChat, minimizeChat } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingState])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeChat])

  return (
    <motion.div
      variants={chatPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
        'fixed z-50',
        'inset-0 h-full w-full sm:inset-auto sm:bottom-6 sm:right-6',
        'sm:h-[560px] sm:w-[380px] md:h-[560px]',
        'max-sm:rounded-none',
      )}
      role="dialog"
      aria-label="Sankofa Hub chat"
      aria-modal="true"
    >
      <ChatHeader
        onMinimize={minimizeChat}
        onClose={closeChat}
        onReset={resetChat}
      />

      {isHealthy === false && (
        <p className="mx-3 mt-2 rounded-lg bg-terracotta/10 px-3 py-1.5 text-xs text-terracotta dark:text-terracotta-dark" role="status">
          Server is offline — responses may be delayed
        </p>
      )}

      <ScrollArea className="flex-1">
        <div role="log" aria-live="polite" aria-label="Chat messages" className="py-2">
          {isChecking ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xs text-muted-foreground">Connecting...</span>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="px-4 py-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Akwaaba! Ask me anything about Ghana and West Africa — culture, tourism, languages, travel, traditions, and more.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {loadingState.status === 'thinking' && <ThinkingIndicator />}
              {loadingState.status === 'typing' && (
                <TypingIndicator
                  botId={loadingState.botId}
                  botName={loadingState.botName}
                />
              )}
              {loadingState.status === 'error' && (
                <div className="px-4 py-2">
                  <p className="text-xs text-terracotta">{loadingState.message}</p>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatInput onSend={sendMessage} disabled={!canSend} />
    </motion.div>
  )
}
