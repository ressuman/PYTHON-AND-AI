export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2" aria-label="Thinking">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/50"
            style={{
              animation: 'pulseDot 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">Thinking...</span>
    </div>
  )
}
