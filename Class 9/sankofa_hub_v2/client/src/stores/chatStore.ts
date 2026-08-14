import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, LoadingState } from '@/types'

const MAX_GUEST_QUESTIONS = 6

interface ChatStore {
  isOpen: boolean
  isMinimized: boolean
  messages: Message[]
  loadingState: LoadingState
  hasOpenedBefore: boolean
  currentConversationId: string | null
  guestQuestionCount: number
  isLocked: boolean

  openChat: () => void
  closeChat: () => void
  minimizeChat: () => void
  maximizeChat: () => void
  addMessage: (message: Message) => void
  incrementGuestQuestion: () => void
  lockChat: () => void
  setLoadingState: (state: LoadingState) => void
  clearMessages: () => void
  setHasOpenedBefore: (value: boolean) => void
  setConversationId: (id: string | null) => void
  clearConversationId: () => void
  resetGuest: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isOpen: false,
      isMinimized: false,
      messages: [],
      loadingState: { status: 'idle' },
      hasOpenedBefore: false,
      currentConversationId: null,
      guestQuestionCount: 0,
      isLocked: false,

      openChat: () => set({ isOpen: true, isMinimized: false, hasOpenedBefore: true }),
      closeChat: () => set({ isOpen: false, isMinimized: false }),
      minimizeChat: () => set({ isMinimized: true }),
      maximizeChat: () => set({ isMinimized: false, isOpen: true }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      incrementGuestQuestion: () =>
        set((state) => {
          const next = state.guestQuestionCount + 1
          if (next >= MAX_GUEST_QUESTIONS) {
            return { guestQuestionCount: next, isLocked: true }
          }
          return { guestQuestionCount: next }
        }),
      lockChat: () => set({ isLocked: true }),
      setLoadingState: (state) => set({ loadingState: state }),
      clearMessages: () =>
        set({ messages: [], loadingState: { status: 'idle' }, guestQuestionCount: 0, isLocked: false }),
      setHasOpenedBefore: (value) => set({ hasOpenedBefore: value }),
      setConversationId: (id) => set({ currentConversationId: id }),
      clearConversationId: () => set({ currentConversationId: null }),
      resetGuest: () => set({ guestQuestionCount: 0, isLocked: false }),
    }),
    {
      name: 'sankofa-chat',
      partialize: (state) => ({
        hasOpenedBefore: state.hasOpenedBefore,
        guestQuestionCount: state.guestQuestionCount,
        isLocked: state.isLocked,
        messages: state.messages,
        currentConversationId: state.currentConversationId,
      }),
    },
  ),
)
