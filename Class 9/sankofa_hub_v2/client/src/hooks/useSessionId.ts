import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'sankofa_session_id'

export function useSessionId(): string {
  return useMemo(() => {
    let sessionId = localStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  }, [])
}
