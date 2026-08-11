import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history'

export function useHistory() {
  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: historyApi.listConversations,
  })

  return { conversations, isLoading, refetch }
}
