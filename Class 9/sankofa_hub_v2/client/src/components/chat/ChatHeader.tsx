import { Minus, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatHeaderProps {
  onMinimize: () => void
  onClose: () => void
  onReset: () => void
}

export function ChatHeader({ onMinimize, onClose, onReset }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gold/15 shrink-0">
          <span className="text-sm" aria-hidden="true">🏛️</span>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">
            Sankofa Hub
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            Culture · Tourism · Language
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onReset}
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={onMinimize}
          aria-label="Minimize chat"
          title="Minimize"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label="Close chat"
          title="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
