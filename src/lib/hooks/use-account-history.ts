'use client'

import { useQuery } from '@tanstack/react-query'
import { accountHistoryService } from '@/lib/services/account-history.service'

export function useAccountHistory(accountId: string | null) {
  return useQuery({
    queryKey: ['account-history', accountId],
    queryFn: () => accountHistoryService.listByAccount(accountId!),
    enabled: !!accountId,
    staleTime: 0,
  })
}
