import { User } from 'lucide-react'
import type { BotId } from '@/types'
import { cn } from '@/lib/utils'

interface BotAvatarProps {
  botId?: BotId
  botName?: string
  initials?: string
  color?: string
  bgColor?: string
  size?: 'sm' | 'md'
  showStatus?: boolean
}

export function BotAvatar({ initials, color, bgColor, size = 'sm', showStatus }: BotAvatarProps) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base'
  const fallbackColor = '#8B8B8B'
  const fallbackBg = '#F0F0F0'
  const dotColor = color || fallbackColor

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeClass,
        )}
        style={{ backgroundColor: bgColor || fallbackBg, color: color || fallbackColor }}
        aria-hidden="true"
      >
        {initials || <User className="h-4 w-4" />}
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
