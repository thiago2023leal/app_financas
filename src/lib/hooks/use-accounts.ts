'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsService } from '@/lib/services/accounts.service'
import type { Account, AccountFormData } from '@/types'
import { toast } from 'sonner'

export const ACCOUNTS_QUERY_KEY = ['accounts'] as const

export function useAccounts() {
  const queryClient = useQueryClient()

  const { data: accounts = [], isLoading: loading, isError } = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: accountsService.list,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (isError) toast.error('Erro ao carregar contas.')
  }, [isError])

  const createMutation = useMutation({
    mutationFn: (formData: AccountFormData) => accountsService.create(formData),
    onSuccess: (account) => {
      queryClient.setQueryData<Account[]>(ACCOUNTS_QUERY_KEY, (old = []) => [...old, account])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<AccountFormData> }) =>
      accountsService.update(id, formData),
    onSuccess: (account) => {
      queryClient.setQueryData<Account[]>(ACCOUNTS_QUERY_KEY, (old = []) =>
        old.map((a) => (a.id === account.id ? account : a))
      )
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => accountsService.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Account[]>(ACCOUNTS_QUERY_KEY, (old = []) =>
        old.filter((a) => a.id !== id)
      )
    },
  })

  const reload = () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0)

  const create = (formData: AccountFormData) => createMutation.mutateAsync(formData)
  const update = (id: string, formData: Partial<AccountFormData>) =>
    updateMutation.mutateAsync({ id, formData })
  const remove = (id: string) => removeMutation.mutateAsync(id)

  return { accounts, loading, create, update, remove, reload, totalBalance }
}
