import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, MessageSquare, MessageCircle, TrendingUp,
  Trash2, Edit2, Shield, ShieldOff, UserX, UserCheck,
  Search, X, AlertTriangle, ArrowLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminApi, type AdminStats, type AdminUser, type AdminConversation, type AuditLogEntry } from '@/api/admin'
import { cn } from '@/lib/utils'

const BOT_COLORS: Record<string, string> = {
  'Nana Kwame': 'bg-blue-500',
  'Maame Yaa': 'bg-emerald-500',
  'Osei Tutu': 'bg-amber-600',
  'Obaa Sarpongmaa': 'bg-purple-500',
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'destructive',
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'destructive' | 'warning'
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center',
            variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30',
          )}>
            <AlertTriangle className={cn(
              'h-5 w-5',
              variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400',
            )} />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            size="sm"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

function EditUserDialog({
  user,
  open,
  onClose,
  onSave,
}: {
  user: AdminUser | null
  open: boolean
  onClose: () => void
  onSave: (name: string, email: string) => void
}) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  if (!open || !user) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-foreground mb-4">Edit User</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(name, email)}>Save</Button>
        </div>
      </div>
    </div>
  )
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [userPage, setUserPage] = useState(1)
  const [convPage, setConvPage] = useState(1)
  const [logPage, setLogPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [confirmAction, setConfirmAction] = useState<{
    open: boolean
    title: string
    message: string
    variant: 'destructive' | 'warning'
    onConfirm: () => void
  }>({ open: false, title: '', message: '', variant: 'destructive', onConfirm: () => {} })

  const [editUser, setEditUser] = useState<AdminUser | null>(null)

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30000,
  })

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', userPage, searchQuery],
    queryFn: () => adminApi.getUsers(userPage, 20, searchQuery),
  })
  const users = usersData?.users || []

  const { data: conversations = [] } = useQuery<AdminConversation[]>({
    queryKey: ['admin-conversations', convPage],
    queryFn: () => adminApi.getConversations(convPage),
  })

  const { data: auditLogs = [] } = useQuery<AuditLogEntry[]>({
    queryKey: ['admin-audit-logs', logPage],
    queryFn: () => adminApi.getAuditLogs(logPage),
  })

  const patchMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: string }) =>
      adminApi.patchUser(userId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ userId, name, email }: { userId: string; name: string; email: string }) =>
      adminApi.updateUser(userId, { name, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditUser(null)
    },
  })

  const handleToggleActive = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: user.is_active ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.name}?`,
      variant: 'warning',
      onConfirm: () => {
        patchMutation.mutate({ userId: user.id, action: 'toggle-active' })
        setConfirmAction((s) => ({ ...s, open: false }))
      },
    })
  }

  const handlePromote = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: 'Promote to Admin',
      message: `Are you sure you want to promote ${user.name} to admin? They will have full access to the admin dashboard.`,
      variant: 'warning',
      onConfirm: () => {
        patchMutation.mutate({ userId: user.id, action: 'promote-admin' })
        setConfirmAction((s) => ({ ...s, open: false }))
      },
    })
  }

  const handleDemote = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: 'Demote to User',
      message: `Are you sure you want to demote ${user.name} to regular user?`,
      variant: 'warning',
      onConfirm: () => {
        patchMutation.mutate({ userId: user.id, action: 'demote-user' })
        setConfirmAction((s) => ({ ...s, open: false }))
      },
    })
  }

  const handleDelete = (user: AdminUser) => {
    setConfirmAction({
      open: true,
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${user.name} (${user.email})? This action cannot be undone.`,
      variant: 'destructive',
      onConfirm: () => {
        deleteMutation.mutate(user.id)
        setConfirmAction((s) => ({ ...s, open: false }))
      },
    })
  }

  const handleSaveEdit = (name: string, email: string) => {
    if (editUser) {
      editMutation.mutate({ userId: editUser.id, name, email })
    }
  }

  const handleSearch = () => {
    setUserPage(1)
    setSearchQuery(searchInput)
  }

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.total_users, icon: Users, color: 'border-l-blue-500' },
        { label: 'Conversations', value: stats.total_conversations, icon: MessageSquare, color: 'border-l-emerald-500' },
        { label: 'Messages Today', value: stats.messages_today, icon: MessageCircle, color: 'border-l-amber-500' },
        { label: 'Total Messages', value: stats.total_messages, icon: TrendingUp, color: 'border-l-purple-500' },
      ]
    : []

  const maxBotValue = stats ? Math.max(...Object.values(stats.messages_by_bot), 1) : 1

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer" title="Back to Home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Sankofa Hub Management</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">Admin</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={cn('border-l-4', card.color)}>
            <CardContent className="p-4 flex items-center gap-3">
              <card.icon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Messages by Bot */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages by Bot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.messages_by_bot).map(([bot, count]) => (
              <div key={bot} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{bot}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', BOT_COLORS[bot] || 'bg-gold')}
                    style={{ width: `${(count / maxBotValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">User Management</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 pr-8 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-48"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearchQuery(''); setUserPage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1}>Prev</Button>
              <span className="text-sm text-muted-foreground px-2 self-center">Page {userPage}{usersData?.pages ? ` of ${usersData.pages}` : ''}</span>
              <Button variant="outline" size="sm" onClick={() => setUserPage((p) => p + 1)} disabled={usersData?.pages ? userPage >= usersData.pages : false}>Next</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Joined</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2 text-muted-foreground">{u.email}</td>
                    <td className="py-2">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <span className={cn('inline-block w-2 h-2 rounded-full', u.is_active ? 'bg-emerald-500' : 'bg-red-500')} />
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => { setEditUser(u) }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title={u.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(u)}>
                          {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </Button>
                        {u.role !== 'admin' ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Promote to Admin" onClick={() => handlePromote(u)}>
                            <Shield className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Demote to User" onClick={() => handleDemote(u)}>
                            <ShieldOff className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" title="Delete" onClick={() => handleDelete(u)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Conversations</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setConvPage((p) => Math.max(1, p - 1))} disabled={convPage === 1}>Prev</Button>
            <span className="text-sm text-muted-foreground px-2 self-center">Page {convPage}</span>
            <Button variant="outline" size="sm" onClick={() => setConvPage((p) => p + 1)}>Next</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-2">{c.user_email}</td>
                    <td className="py-2">{c.title || 'Untitled'}</td>
                    <td className="py-2 text-muted-foreground">
                      {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Audit Log</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={logPage === 1}>Prev</Button>
            <span className="text-sm text-muted-foreground px-2 self-center">Page {logPage}</span>
            <Button variant="outline" size="sm" onClick={() => setLogPage((p) => p + 1)}>Next</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">Detail</th>
                  <th className="pb-2 font-medium">User ID</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50">
                    <td className="py-2">
                      <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                    </td>
                    <td className="py-2 text-muted-foreground max-w-[250px] truncate">{log.detail || '—'}</td>
                    <td className="py-2 text-muted-foreground text-[10px]">{log.user_id?.slice(0, 8) || '—'}</td>
                    <td className="py-2 text-muted-foreground">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmAction.open}
        title={confirmAction.title}
        message={confirmAction.message}
        variant={confirmAction.variant}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction((s) => ({ ...s, open: false }))}
      />
      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
