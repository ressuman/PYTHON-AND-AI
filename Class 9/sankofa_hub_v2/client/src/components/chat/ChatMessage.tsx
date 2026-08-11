import { formatDistanceToNow } from 'date-fns'
import { BotAvatar } from './BotAvatar'
import { BOT_CONFIGS } from '@/lib/constants'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
}

const BOT_MSG_STYLES: Record<string, { bg: string; border: string; nameBg: string; nameText: string; text: string }> = {
  general: {
    bg: 'bg-[#FDF8EE]',
    border: 'border-l-[3px] border-l-[#C8920A]',
    nameBg: 'bg-[#C8920A]/10',
    nameText: 'text-[#C8920A]',
    text: 'text-[#5C4A1E]',
  },
  tourism: {
    bg: 'bg-[#F0FAF5]',
    border: 'border-l-[3px] border-l-[#2D6A4F]',
    nameBg: 'bg-[#2D6A4F]/10',
    nameText: 'text-[#2D6A4F]',
    text: 'text-[#1A3D2C]',
  },
  culture: {
    bg: 'bg-[#FDF3EE]',
    border: 'border-l-[3px] border-l-[#8B1A1A]',
    nameBg: 'bg-[#8B1A1A]/10',
    nameText: 'text-[#8B1A1A]',
    text: 'text-[#4A0E0E]',
  },
  language: {
    bg: 'bg-[#F5F0FF]',
    border: 'border-l-[3px] border-l-[#2C2D6B]',
    nameBg: 'bg-[#2C2D6B]/10',
    nameText: 'text-[#2C2D6B]',
    text: 'text-[#1A1A3D]',
  },
}

function formatContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ))
  })
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const botConfig = message.botId ? BOT_CONFIGS[message.botId] : undefined
  const botStyles = message.botId ? BOT_MSG_STYLES[message.botId] : undefined

  return (
    <div
      className={cn('group flex gap-2.5 px-3 py-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
      role="listitem"
    >
      {isUser ? (
        <BotAvatar size="sm" />
      ) : (
        <BotAvatar
          botId={message.botId}
          initials={botConfig?.avatarInitials}
          color={botConfig?.color}
          bgColor={botConfig?.bgColor}
          size="sm"
        />
      )}

      <div className={cn('flex max-w-[82%] flex-col', isUser && 'items-end')}>
        {!isUser && message.botName && (
          <span
            className={cn(
              'mb-1 inline-flex items-center self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              botStyles?.nameBg || 'bg-muted',
              botStyles?.nameText || 'text-muted-foreground',
            )}
          >
            {message.botName}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-gold text-white rounded-br-sm'
              : cn(
                  'rounded-bl-sm border border-transparent',
                  botStyles?.bg || 'bg-card',
                  botStyles?.border || '',
                  botStyles?.text || 'text-card-foreground',
                ),
          )}
        >
          {formatContent(message.content)}
        </div>

        <time
          className="mt-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          dateTime={message.timestamp.toISOString()}
        >
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </time>
      </div>
    </div>
  )
}
