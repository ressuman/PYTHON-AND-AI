import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('sankofa-auth')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch {
      /* ignore */
    }
  }
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sankofa-auth')
    }
    const message =
      error.response?.data?.detail || error.message || 'An error occurred'
    if (import.meta.env.DEV) {
      console.error('[API Error]', message)
    }
    return Promise.reject(new Error(message))
  },
)
