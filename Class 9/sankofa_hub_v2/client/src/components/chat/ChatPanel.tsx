import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, ArrowRight, MessageCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useChat } from '@/hooks/useChat'
import { useHealthCheck } from '@/hooks/useHealthCheck'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { chatPanelVariants } from '@/lib/animations'
import { ChatHeader } from './ChatHeader'
import { ChatMessage } from './ChatMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { cn } from '@/lib/utils'

const MAX_GUEST = 6

export function ChatPanel() {
  const {
    messages,
    loadingState,
    sendMessage,
    resetChat,
    canSend,
    guestQuestionCount,
    isLocked,
  } = useChat()

  const { isHealthy, isChecking } = useHealthCheck()
  const { closeChat } = useChatStore()
  const { isAuthenticated } = useAuthStore()
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

  const showLocked = isLocked && !isAuthenticated
  const questionsLeft = Math.max(0, MAX_GUEST - guestQuestionCount)

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
        'sm:h-[640px] sm:w-[420px]',
        'max-sm:rounded-none',
      )}
      role="dialog"
      aria-label="Sankofa Hub chat"
      aria-modal="true"
    >
      <ChatHeader onMinimize={closeChat} onClose={closeChat} onReset={resetChat} />

      {isHealthy === false && (
        <p className="mx-3 mt-2 rounded-lg bg-terracotta/10 px-3 py-1.5 text-xs text-terracotta dark:text-terracotta-dark" role="status">
          Server is offline — responses may be delayed
        </p>
      )}

      <ScrollArea className="flex-1">
        <div role="log" aria-live="polite" aria-label="Chat messages" className="py-3 px-2">
          {isChecking ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xs text-muted-foreground">Connecting...</span>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gold/10 mb-3">
                    <MessageCircle className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Akwaaba! Ask me anything about Ghana and West Africa — culture, tourism, languages, travel, traditions, and more.
                  </p>
                  {!isAuthenticated && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {questionsLeft} free questions remaining
                    </p>
                  )}
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

      {showLocked && (
        <div className="mx-3 mb-2 rounded-xl border border-gold/30 bg-gradient-to-b from-gold/5 to-gold/10 px-4 py-4">
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gold/20 mb-2">
              <LogIn className="h-5 w-5 text-gold" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              You've used all 6 free questions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sign in to continue chatting with unlimited questions and save your history.
            </p>
          </div>
          <div className="space-y-2">
            <Link to="/auth" onClick={closeChat}>
              <Button size="sm" className="w-full gap-2 text-xs cursor-pointer">
                <LogIn className="h-3.5 w-3.5" />
                Sign In / Register
              </Button>
            </Link>
            <Link to="/ai" onClick={closeChat}>
              <Button size="sm" variant="outline" className="w-full gap-2 text-xs cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" />
                Continue in Full Chat
              </Button>
            </Link>
          </div>
          {messages.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Your {messages.length} messages are saved and will be available after login.
            </p>
          )}
        </div>
      )}

      {!showLocked && !isAuthenticated && messages.length > 0 && questionsLeft <= 2 && questionsLeft > 0 && (
        <div className="mx-3 mb-2 rounded-lg bg-gold/10 border border-gold/20 px-3 py-2">
          <p className="text-[10px] text-muted-foreground text-center">
            {questionsLeft} {questionsLeft === 1 ? 'question' : 'questions'} remaining — {' '}
            <Link to="/auth" onClick={closeChat} className="text-gold font-medium hover:underline">
              Sign in for unlimited access
            </Link>
          </p>
        </div>
      )}

      <div className="px-3 pb-3">
        <ChatInput
          onSend={sendMessage}
          disabled={!canSend}
          placeholder={
            showLocked
              ? 'Sign in to continue chatting...'
              : !isAuthenticated && questionsLeft <= 2
                ? `${questionsLeft} questions left...`
                : undefined
          }
        />
      </div>
    </motion.div>
  )
}
