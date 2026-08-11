export type BotId = 'general' | 'tourism' | 'culture' | 'language'

export type LoadingState =
  | { status: 'idle' }
  | { status: 'thinking' }
  | { status: 'typing'; botName: string; botId: BotId }
  | { status: 'error'; message: string }

export interface BotConfig {
  id: BotId
  skillId: string
  name: string
  fullName: string
  description: string
  color: string
  darkColor: string
  bgColor: string
  darkBgColor: string
  icon: string
  emoji: string
  greeting: string
  placeholder: string
  avatarInitials: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  botId?: BotId
  botName?: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  user_id: string
  conversation_id?: string | null
}

export interface ChatResponse {
  reply: string
  bot_name: string
  bot_id: string
  route_taken: string
  conversation_id?: string | null
}

export interface SessionResponse {
  user_id: string
  history: Array<[string, string, string]>
  bot_id: string
}

export interface HealthResponse {
  status: string
  bots: string[]
}
