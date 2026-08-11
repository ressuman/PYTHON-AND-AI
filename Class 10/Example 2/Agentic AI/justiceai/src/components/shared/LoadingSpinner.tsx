"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
}

const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={`${sizes[size]} rounded-full border-4 border-indigo-600 border-t-transparent animate-spin`} />
  )
}
