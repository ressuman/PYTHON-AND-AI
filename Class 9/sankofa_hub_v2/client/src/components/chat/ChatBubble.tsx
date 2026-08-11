import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'

export function ChatBubble() {
  const openChat = useChatStore((s) => s.openChat)

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openChat}
      className="group relative flex items-center gap-2.5 rounded-full bg-card px-4 py-3 shadow-lg ring-1 ring-border transition-all hover:shadow-xl hover:ring-gold/30"
      aria-label="Open chat with Sankofa Hub"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
        <MessageCircle className="h-5 w-5 text-gold transition-transform group-hover:scale-110" />
      </span>
      <div className="hidden sm:flex flex-col items-start">
        <span className="text-sm font-semibold text-foreground leading-none">
          Sankofa Hub
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          Ask about Ghana & West Africa
        </span>
      </div>
    </motion.button>
  )
}
