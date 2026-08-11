import { apiClient } from './client'

export interface RegisterPayload {
  email: string
  name: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UserPublic {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserPublic
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
    return data
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },
  me: async (): Promise<UserPublic> => {
    const { data } = await apiClient.get<UserPublic>('/auth/me')
    return data
  },
}
