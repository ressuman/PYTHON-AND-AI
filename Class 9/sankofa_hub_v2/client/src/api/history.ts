import { apiClient } from './client'

export interface ConversationSummary {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count: number
}

export interface MessageDetail {
  id: string
  role: string
  content: string
  bot_id: string | null
  bot_name: string | null
  created_at: string | null
}

export interface ConversationDetail {
  id: string
  title: string | null
  created_at: string | null
  messages: MessageDetail[]
}

export const historyApi = {
  listConversations: async (): Promise<ConversationSummary[]> => {
    const { data } = await apiClient.get<ConversationSummary[]>('/history/conversations')
    return data
  },
  getConversation: async (id: string): Promise<ConversationDetail> => {
    const { data } = await apiClient.get<ConversationDetail>(`/history/conversations/${id}`)
    return data
  },
  createConversation: async (): Promise<{ id: string; title: string | null; created_at: string | null }> => {
    const { data } = await apiClient.post('/history/conversations')
    return data
  },
  getMessages: async (id: string): Promise<MessageDetail[]> => {
    const { data } = await apiClient.get<MessageDetail[]>(`/history/conversations/${id}/messages`)
    return data
  },
}
