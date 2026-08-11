import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { chatApi } from '@/api/chatbot'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { sanitizeInput } from '@/lib/utils'
import type { Message, BotId } from '@/types'
import { useSessionId } from './useSessionId'

const SEND_DEBOUNCE_MS = 300

export function useChat() {
  const sessionId = useSessionId()
  const lastSendRef = useRef(0)
  const [canSend, setCanSend] = useState(true)
  const { user } = useAuthStore()

  const {
    messages,
    loadingState,
    addMessage,
    setLoadingState,
    clearMessages,
    currentConversationId,
    setConversationId,
    guestQuestionCount,
    incrementGuestQuestion,
    isLocked,
  } = useChatStore()

  const canSendMessage = !isLocked || !!user

  const sendMessage = useCallback(
    async (content: string) => {
      const sanitized = sanitizeInput(content)
      if (!sanitized || loadingState.status !== 'idle' || !canSend) return
      if (!canSendMessage) return

      const now = Date.now()
      if (now - lastSendRef.current < SEND_DEBOUNCE_MS) return
      lastSendRef.current = now
      setCanSend(false)
      setTimeout(() => setCanSend(true), SEND_DEBOUNCE_MS)

      if (!user) {
        incrementGuestQuestion()
      }

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: sanitized,
        timestamp: new Date(),
      }
      addMessage(userMessage)
      setLoadingState({ status: 'thinking' })

      try {
        const response = await chatApi.sendMessage({
          message: sanitized,
          user_id: user?.id || sessionId,
          conversation_id: currentConversationId,
        })

        if (response.conversation_id) {
          setConversationId(response.conversation_id)
        }

        const botId = response.bot_id as BotId

        setLoadingState({
          status: 'typing',
          botName: response.bot_name,
          botId,
        })

        const botMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.reply,
          botId,
          botName: response.bot_name,
          timestamp: new Date(),
        }
        addMessage(botMessage)
        setLoadingState({ status: 'idle' })
      } catch {
        setLoadingState({
          status: 'error',
          message:
            "I'm sorry, I'm having trouble connecting right now. Please check that the Sankofa Hub server is running and try again.",
        })
        setTimeout(() => setLoadingState({ status: 'idle' }), 3000)
      }
    },
    [loadingState.status, canSend, canSendMessage, sessionId, user, currentConversationId, addMessage, setLoadingState, setConversationId, incrementGuestQuestion],
  )

  const resetChat = useCallback(async () => {
    try {
      await chatApi.clearSession(sessionId)
    } catch {
      /* silent fail */
    }
    clearMessages()
  }, [sessionId, clearMessages])

  return {
    messages,
    loadingState,
    sendMessage,
    resetChat,
    canSend: canSend && loadingState.status === 'idle' && canSendMessage,
    guestQuestionCount,
    isLocked,
  }
}
