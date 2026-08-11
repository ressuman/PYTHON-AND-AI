import { apiClient } from './client'

export interface AdminStats {
  total_users: number
  total_conversations: number
  total_messages: number
  messages_today: number
  messages_by_bot: Record<string, number>
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  total: number
  page: number
  pages: number
}

export interface AdminConversation {
  id: string
  user_email: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  detail: string | null
  ip_address: string | null
  created_at: string
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<AdminStats>('/admin/stats')
    return data
  },

  getUsers: async (page = 1, limit = 20, search = ''): Promise<AdminUsersResponse> => {
    const { data } = await apiClient.get<AdminUsersResponse>('/admin/users', {
      params: { page, limit, search },
    })
    return data
  },

  getUser: async (userId: string): Promise<AdminUser> => {
    const { data } = await apiClient.get<AdminUser>(`/admin/users/${userId}`)
    return data
  },

  updateUser: async (userId: string, body: { name?: string; email?: string }): Promise<AdminUser> => {
    const { data } = await apiClient.put<AdminUser>(`/admin/users/${userId}`, body)
    return data
  },

  patchUser: async (userId: string, action: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}`, null, { params: { action } })
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`)
  },

  getConversations: async (page = 1, limit = 20): Promise<AdminConversation[]> => {
    const { data } = await apiClient.get<AdminConversation[]>('/admin/conversations', {
      params: { page, limit },
    })
    return data
  },

  getAuditLogs: async (page = 1, limit = 20): Promise<AuditLogEntry[]> => {
    const { data } = await apiClient.get<AuditLogEntry[]>('/admin/audit-logs', {
      params: { page, limit },
    })
    return data
  },
}
