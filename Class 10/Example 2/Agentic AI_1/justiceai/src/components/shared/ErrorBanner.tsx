"use client"

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
      <span className="text-red-400 text-lg">⚠️</span>
      <p className="text-sm text-red-300 flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-200 text-lg leading-none">×</button>
      )}
    </div>
  )
}
