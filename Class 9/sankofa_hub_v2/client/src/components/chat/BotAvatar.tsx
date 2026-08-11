import { User } from 'lucide-react'
import type { BotId } from '@/types'
import { cn } from '@/lib/utils'

const BOT_ICONS: Record<string, string> = {
  general: '👑',
  tourism: '🗺️',
  culture: '🏛️',
  language: '📚',
}

interface BotAvatarProps {
  botId?: BotId
  botName?: string
  initials?: string
  color?: string
  bgColor?: string
  size?: 'sm' | 'md'
  showStatus?: boolean
}

export function BotAvatar({ botId, color, bgColor, size = 'sm', showStatus }: BotAvatarProps) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base'
  const iconSize = size === 'sm' ? 'text-sm' : 'text-base'
  const fallbackColor = '#8B8B8B'
  const fallbackBg = '#F0F0F0'
  const dotColor = color || fallbackColor
  const icon = botId ? BOT_ICONS[botId] : undefined

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold ring-2 ring-offset-1 ring-offset-background',
          sizeClass,
        )}
        style={{
          backgroundColor: bgColor || fallbackBg,
          color: color || fallbackColor,
          ringColor: color || fallbackColor,
        }}
        aria-hidden="true"
      >
        {icon ? (
          <span className={iconSize}>{icon}</span>
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      {showStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
          style={{ backgroundColor: dotColor }}
          aria-label="Online"
        />
      )}
    </div>
  )
}
