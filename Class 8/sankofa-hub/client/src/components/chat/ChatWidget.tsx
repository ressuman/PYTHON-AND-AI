import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/stores/chatStore'
import { ChatPanel } from './ChatPanel'
import { ChatBubble } from './ChatBubble'

export function ChatWidget() {
  const { isOpen, messages, hasOpenedBefore, openChat } = useChatStore()

  useEffect(() => {
    if (!hasOpenedBefore) {
      const timer = setTimeout(() => {
        openChat()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasOpenedBefore, openChat])

  const unreadCount = !isOpen ? messages.length : 0

  return (
    <div className="fixed bottom-6 right-6 z-50 max-sm:bottom-4 max-sm:right-4">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <ChatPanel key="panel" />
        ) : (
          <ChatBubble key="bubble" unreadCount={unreadCount} />
        )}
      </AnimatePresence>
    </div>
  )
}
