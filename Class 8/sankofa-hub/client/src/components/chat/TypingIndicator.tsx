import { BotAvatar } from './BotAvatar'
import { BOT_CONFIGS } from '@/lib/constants'
import type { BotId } from '@/types'

interface TypingIndicatorProps {
  botId: BotId
  botName: string
}

export function TypingIndicator({ botId, botName }: TypingIndicatorProps) {
  const config = BOT_CONFIGS[botId]

  return (
    <div className="flex items-center gap-2 px-4 py-2" aria-label={`${botName} is typing`}>
      <BotAvatar
        botId={botId}
        initials={config?.avatarInitials}
        color={config?.color}
        bgColor={config?.bgColor}
        size="sm"
      />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: config?.color || '#8B8B8B',
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
