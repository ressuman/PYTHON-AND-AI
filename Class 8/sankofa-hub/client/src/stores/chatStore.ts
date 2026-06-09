import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, LoadingState } from '@/types'

interface ChatStore {
  isOpen: boolean
  messages: Message[]
  loadingState: LoadingState
  hasOpenedBefore: boolean
  isMinimized: boolean

  openChat: () => void
  closeChat: () => void
  minimizeChat: () => void
  maximizeChat: () => void
  addMessage: (message: Message) => void
  setLoadingState: (state: LoadingState) => void
  clearMessages: () => void
  setHasOpenedBefore: (value: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      loadingState: { status: 'idle' },
      hasOpenedBefore: false,
      isMinimized: false,

      openChat: () =>
        set({ isOpen: true, isMinimized: false, hasOpenedBefore: true }),
      closeChat: () => set({ isOpen: false }),
      minimizeChat: () => set({ isMinimized: true }),
      maximizeChat: () => set({ isMinimized: false }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setLoadingState: (state) => set({ loadingState: state }),
      clearMessages: () => set({ messages: [], loadingState: { status: 'idle' } }),
      setHasOpenedBefore: (value) => set({ hasOpenedBefore: value }),
    }),
    {
      name: 'sankofa-chat',
      partialize: (state) => ({
        hasOpenedBefore: state.hasOpenedBefore,
      }),
    },
  ),
)
