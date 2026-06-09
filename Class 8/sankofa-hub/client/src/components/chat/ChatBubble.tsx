import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'

interface ChatBubbleProps {
  unreadCount?: number
}

export function ChatBubble({ unreadCount = 0 }: ChatBubbleProps) {
  const openChat = useChatStore((s) => s.openChat)

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={openChat}
      className="group relative flex items-center gap-2 rounded-full bg-card px-4 py-3 shadow-lg ring-2 ring-gold/30 transition-shadow hover:shadow-xl"
      aria-label="Open chat with Sankofa Hub"
    >
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: '#C8920A' }}
        aria-hidden="true"
      />
      <span className="relative text-2xl">Sankofa</span>
      <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-foreground transition-all group-hover:max-w-xs group-hover:pl-1 sm:inline">
        Chat with Sankofa Hub
      </span>
      {unreadCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white"
          aria-label={`${unreadCount} unread messages`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      <MessageCircle
        className="relative h-4 w-4 text-muted-foreground sm:hidden"
        aria-hidden="true"
      />
    </motion.button>
  )
}
