import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setAuth(response.user as any, response.access_token)
    navigate('/ai')
    return response
  }, [setAuth, navigate])

  const register = useCallback(async (email: string, name: string, password: string) => {
    const response = await authApi.register({ email, name, password })
    setAuth(response.user as any, response.access_token)
    navigate('/ai')
    return response
  }, [setAuth, navigate])

  const logout = useCallback(() => {
    clearAuth()
    navigate('/')
  }, [clearAuth, navigate])

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
