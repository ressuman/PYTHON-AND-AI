import { apiClient } from './client'
import type {
  ChatRequest,
  ChatResponse,
  SessionResponse,
  HealthResponse,
} from './types'

export const chatApi = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/chat', payload)
    return data
  },

  getSession: async (userId: string): Promise<SessionResponse> => {
    const { data } = await apiClient.get<SessionResponse>(`/session/${userId}`)
    return data
  },

  clearSession: async (userId: string): Promise<void> => {
    await apiClient.delete(`/session/${userId}`)
  },

  checkHealth: async (): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>('/health')
    return data
  },
}

export type { ChatRequest, ChatResponse }
