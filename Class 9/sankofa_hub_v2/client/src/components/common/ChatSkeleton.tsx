export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-label="Loading chat">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          {i % 2 !== 0 && (
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-sankofa-warm dark:bg-sankofa-card" />
          )}
          <div
            className={`h-12 animate-pulse rounded-xl bg-sankofa-warm dark:bg-sankofa-card ${
              i % 2 === 0 ? 'w-2/3' : 'w-3/4'
            }`}
          />
        </div>
      ))}
    </div>
  )
}
