import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Menu, Plus, LogOut, PanelLeftClose, PanelLeft,
  Home, Shield, Trash2,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { ThinkingIndicator } from '@/components/chat/ThinkingIndicator'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { SankofaLogo } from '@/components/common/AdinkraPattern'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { useHistory } from '@/hooks/useHistory'
import { useConversation } from '@/hooks/useConversation'
import { chatApi } from '@/api/chatbot'
import { cn } from '@/lib/utils'
import type { Message, BotId } from '@/types'
import type { LoadingState } from '@/types'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function AiChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { conversations, isLoading: historyLoading } = useHistory()
  const { conversation, isLoading: convLoading } = useConversation(conversationId)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentConvId, setCurrentConvId] = useState<string | null>(conversationId || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastSendRef = useRef(0)

  useEffect(() => {
    if (conversationId && conversation) {
      setCurrentConvId(conversationId)
      setMessages(
        conversation.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          botId: (m.bot_id as BotId) || undefined,
          botName: m.bot_name || undefined,
          timestamp: new Date(m.created_at || Date.now()),
        })),
      )
    }
  }, [conversationId, conversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingState])

  const sendMessage = useCallback(
    async (content: string) => {
      const sanitized = content.trim()
      if (!sanitized || loadingState.status !== 'idle') return

      const now = Date.now()
      if (now - lastSendRef.current < 300) return
      lastSendRef.current = now

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: sanitized,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setLoadingState({ status: 'thinking' })

      try {
        const response = await chatApi.sendMessage({
          message: sanitized,
          user_id: user?.id || 'default',
          conversation_id: currentConvId,
        })

        if (response.conversation_id && response.conversation_id !== currentConvId) {
          setCurrentConvId(response.conversation_id)
          navigate(`/ai/${response.conversation_id}`, { replace: true })
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }

        const botId = response.bot_id as BotId
        setLoadingState({
          status: 'typing',
          botName: response.bot_name,
          botId,
        })

        const botMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.reply,
          botId,
          botName: response.bot_name,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setLoadingState({ status: 'idle' })
      } catch {
        setLoadingState({
          status: 'error',
          message: 'Connection error. Please check the server is running.',
        })
        setTimeout(() => setLoadingState({ status: 'idle' }), 3000)
      }
    },
    [loadingState, currentConvId, user, navigate, queryClient],
  )

  const startNewChat = useCallback(() => {
    setMessages([])
    setCurrentConvId(null)
    navigate('/ai', { replace: true })
  }, [navigate])

  const groupConversations = (convs: typeof conversations) => {
    const today: typeof conversations = []
    const yesterday: typeof conversations = []
    const thisWeek: typeof conversations = []
    const older: typeof conversations = []

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    for (const c of convs) {
      const d = new Date(c.updated_at)
      if (d >= todayStart) today.push(c)
      else if (d >= yesterdayStart) yesterday.push(c)
      else if (d >= weekStart) thisWeek.push(c)
      else older.push(c)
    }

    return { today, yesterday, thisWeek, older }
  }

  const grouped = groupConversations(conversations)

  const currentConv = conversations.find((c) => c.id === currentConvId)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <SankofaLogo size={28} />
          <span className="font-display font-bold text-lg">Sankofa Hub</span>
        </div>
        <Button
          onClick={startNewChat}
          className="w-full gap-2 cursor-pointer"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {historyLoading ? (
            <div className="space-y-2 px-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {renderGroup('Today', grouped.today, currentConvId, navigate)}
              {renderGroup('Yesterday', grouped.yesterday, currentConvId, navigate)}
              {renderGroup('Last 7 Days', grouped.thisWeek, currentConvId, navigate)}
              {renderGroup('Older', grouped.older, currentConvId, navigate)}
              {conversations.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start a new chat to begin
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border mt-auto space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <Link to="/admin">
            <Button variant="outline" size="sm" className="w-full gap-2 cursor-pointer text-xs">
              <Shield className="h-3.5 w-3.5" />
              Admin Dashboard
            </Button>
          </Link>
        )}
        <Link to="/">
          <Button variant="ghost" size="sm" className="w-full gap-2 cursor-pointer text-xs">
            <Home className="h-3.5 w-3.5" />
            Back to Home
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 cursor-pointer text-xs text-terracotta hover:text-terracotta"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden',
        )}
      >
        {sidebarContent}
      </aside>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md hover:bg-muted transition-colors cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SankofaLogo size={20} className="shrink-0" />
            <h1 className="font-display font-bold text-base truncate">
              {currentConv?.title || 'Sankofa Hub'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full hidden sm:inline">
              {user?.name || 'Guest'}
            </span>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 && !convLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <SankofaLogo size={64} />
                <h2 className="font-display text-xl font-bold mt-4 mb-2">
                  Akwaaba!
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Start a new conversation or select one from the sidebar.
                  Ask about Ghanaian culture, tourism, or languages.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {loadingState.status === 'thinking' && <ThinkingIndicator />}
                {loadingState.status === 'typing' && (
                  <TypingIndicator
                    botId={loadingState.botId}
                    botName={loadingState.botName}
                  />
                )}
                {loadingState.status === 'error' && (
                  <div className="px-4 py-2">
                    <p className="text-xs text-terracotta">{loadingState.message}</p>
                  </div>
                )}
              </>
            )}
            {convLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="space-y-4 w-full max-w-xl">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                        <div className="h-16 bg-muted rounded-lg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-card/50 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={loadingState.status !== 'idle'} />
          </div>
        </div>
      </main>
    </div>
  )
}

function renderGroup(
  label: string,
  convs: ReturnType<typeof useHistory>['conversations'],
  currentId: string | null,
  navigate: ReturnType<typeof useNavigate>,
) {
  if (convs.length === 0) return null
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
        {label}
      </p>
      {convs.map((c) => (
        <button
          key={c.id}
          onClick={() => navigate(`/ai/${c.id}`)}
          className={cn(
            'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
            currentId === c.id
              ? 'bg-gold/10 border-l-2 border-gold text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <p className="truncate font-medium">{c.title || 'New conversation'}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {c.message_count} {c.message_count === 1 ? 'message' : 'messages'}
          </p>
        </button>
      ))}
    </div>
  )
}
