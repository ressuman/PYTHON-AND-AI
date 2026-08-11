import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history'

export function useConversation(conversationId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => historyApi.getConversation(conversationId!),
    enabled: !!conversationId,
  })

  return { conversation: data, isLoading }
}
