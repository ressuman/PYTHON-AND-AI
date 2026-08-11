"use client"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      {action && (
        <button onClick={action.onClick} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}
