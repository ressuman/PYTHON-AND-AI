import type { ReactNode } from 'react'

type AdinkraSymbol = 'sankofa' | 'gye-nyame' | 'adinkrahene' | 'dwennimmen'

interface AdinkraPatternProps {
  symbol?: AdinkraSymbol
  size?: number
  opacity?: number
  color?: string
  className?: string
}

const SYMBOLS: Record<AdinkraSymbol, ReactNode> = {
  sankofa: (
    <path
      d="M50 15 C35 5, 15 20, 20 45 C25 70, 50 85, 50 85 C50 85, 75 70, 80 45 C85 20, 65 5, 50 15 Z M50 30 C42 25, 30 35, 32 48 C34 58, 50 68, 50 68 C50 68, 66 58, 68 48 C70 35, 58 25, 50 30 Z M42 55 L38 75 L46 72 Z"
      fill="currentColor"
    />
  ),
  'gye-nyame': (
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4" />
  ),
  adinkrahene: (
    <>
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  dwennimmen: (
    <path
      d="M25 60 Q50 20, 75 60 Q50 80, 25 60 Z"
      fill="currentColor"
      opacity="0.8"
    />
  ),
}

export function AdinkraPattern({
  symbol = 'sankofa',
  size = 80,
  opacity = 0.15,
  color = 'currentColor',
  className = '',
}: AdinkraPatternProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity, color }}
      aria-hidden="true"
    >
      {SYMBOLS[symbol]}
    </svg>
  )
}

export function SankofaLogo({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Sankofa Hub logo"
    >
      <circle cx="50" cy="50" r="48" fill="#C8922A" opacity="0.15" />
      <path
        d="M50 18 C38 10, 18 22, 22 48 C26 68, 50 82, 50 82 C50 82, 74 68, 78 48 C82 22, 62 10, 50 18 Z M50 32 C44 28, 34 36, 36 46 C38 54, 50 62, 50 62 C50 62, 62 54, 64 46 C66 36, 56 28, 50 32 Z"
        fill="#C8922A"
      />
      <path d="M44 58 L40 78 L48 74 Z" fill="#1A6B4A" />
    </svg>
  )
}
