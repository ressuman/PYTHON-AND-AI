"use client"

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical" | null | undefined
}

const config: Record<"low" | "medium" | "high" | "critical", { label: string; className: string }> = {
  low: { label: "🟢 LOW RISK", className: "bg-green-500/20 text-green-400 border border-green-500/30" },
  medium: { label: "🟡 MEDIUM RISK", className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  high: { label: "🔴 HIGH RISK", className: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
  critical: { label: "🚨 CRITICAL", className: "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" },
}

export function RiskBadge({ level }: RiskBadgeProps) {
  if (!level) return null

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config[level].className}`}>
      {config[level].label}
    </span>
  )
}
