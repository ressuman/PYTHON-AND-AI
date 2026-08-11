import { useEffect, useState } from 'react'
import { chatApi } from '@/api/chatbot'

export function useHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const result = await chatApi.checkHealth()
        if (!cancelled) {
          setIsHealthy(result.status === 'ok')
        }
      } catch {
        if (!cancelled) setIsHealthy(false)
      } finally {
        if (!cancelled) setIsChecking(false)
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { isHealthy, isChecking }
}
