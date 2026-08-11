export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
}

export type ToolType = "legal" | "code"

export type RiskLevel = "low" | "medium" | "high" | "critical"

export type MessageRole = "user" | "assistant" | "system"

export interface ChatSession {
  id: string
  userId: string
  toolType: ToolType
  title: string
  documentUrl?: string
  documentName?: string
  documentType?: string
  riskLevel?: RiskLevel | null
  language?: string
  contentSnapshot?: string
  isArchived: boolean
  messageCount: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  role: MessageRole
  content: string
  metadata?: string
  createdAt: Date | string
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}
