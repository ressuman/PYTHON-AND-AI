import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: ReactNode
  className?: string
  id?: string
}

export function PageWrapper({ children, className, id }: PageWrapperProps) {
  return (
    <section
      id={id}
      className={cn('mx-auto max-w-7xl px-6 py-20 md:py-28', className)}
    >
      {children}
    </section>
  )
}
