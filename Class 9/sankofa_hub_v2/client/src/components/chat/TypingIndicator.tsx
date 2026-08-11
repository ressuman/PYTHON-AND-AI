import { BotAvatar } from './BotAvatar'
import { BOT_CONFIGS } from '@/lib/constants'
import type { BotId } from '@/types'

interface TypingIndicatorProps {
  botId: BotId
  botName: string
}

const BOT_TYPING_COLORS: Record<string, string> = {
  general: '#C8920A',
  tourism: '#2D6A4F',
  culture: '#8B1A1A',
  language: '#2C2D6B',
}

export function TypingIndicator({ botId, botName }: TypingIndicatorProps) {
  const config = BOT_CONFIGS[botId]
  const dotColor = BOT_TYPING_COLORS[botId] || '#8B8B8B'

  return (
    <div className="flex items-center gap-2 px-4 py-2" aria-label={`${botName} is typing`}>
      <BotAvatar
        botId={botId}
        initials={config?.avatarInitials}
        color={config?.color}
        bgColor={config?.bgColor}
        size="sm"
      />
      <div
        className="flex items-center gap-1 rounded-full px-3 py-1.5"
        style={{ backgroundColor: `${dotColor}10` }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: dotColor,
              animation: 'pulseDot 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {botName} is typing...
      </span>
    </div>
  )
}
