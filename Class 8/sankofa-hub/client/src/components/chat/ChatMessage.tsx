import { formatDistanceToNow } from 'date-fns'
import { BotAvatar } from './BotAvatar'
import { BOT_CONFIGS } from '@/lib/constants'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
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

  return (
    <div
      className={cn('group flex gap-2 px-3 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}
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

      <div className={cn('flex max-w-[85%] flex-col', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm leading-relaxed',
            isUser
              ? 'bg-gold text-white rounded-br-sm'
              : 'border bg-card text-card-foreground rounded-bl-sm',
          )}
          style={
            !isUser && botConfig
              ? { borderLeftColor: botConfig.color, borderLeftWidth: 2 }
              : undefined
          }
        >
          {!isUser && message.botName && (
            <span
              className="mb-1 block text-xs font-semibold"
              style={{ color: botConfig?.color }}
            >
              {message.botName}
            </span>
          )}
          {formatContent(message.content)}
        </div>

        <time
          className="mt-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          dateTime={message.timestamp.toISOString()}
        >
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </time>
      </div>
    </div>
  )
}
