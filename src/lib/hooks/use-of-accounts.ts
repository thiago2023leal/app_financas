'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ofService } from '@/lib/services/of.service'

export const OF_ACCOUNTS_KEY = ['of-accounts'] as const
export const OF_CONNECTIONS_KEY = ['of-connections'] as const

export function useOFAccounts() {
  return useQuery({
    queryKey: OF_ACCOUNTS_KEY,
    queryFn: ofService.listOFAccounts,
    staleTime: 30_000,
  })
}

export function useOFConnections() {
  return useQuery({
    queryKey: OF_CONNECTIONS_KEY,
    queryFn: ofService.listConnections,
    staleTime: 30_000,
  })
}

export function useLinkOFAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ofAccountId, accountId }: { ofAccountId: string; accountId: string }) =>
      ofService.linkOFAccount(ofAccountId, accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OF_ACCOUNTS_KEY }),
  })
}

export function useUnlinkOFAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ofAccountId: string) => ofService.unlinkOFAccount(ofAccountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OF_ACCOUNTS_KEY }),
  })
}
