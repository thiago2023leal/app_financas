'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { creditCardsService } from '@/lib/services/credit-cards.service'
import type { CreditCard, CreditCardFormData } from '@/types'

export const CREDIT_CARDS_QUERY_KEY = ['credit-cards'] as const

export function useCreditCards() {
  const queryClient = useQueryClient()

  const { data: creditCards = [], isLoading } = useQuery({
    queryKey: CREDIT_CARDS_QUERY_KEY,
    queryFn: creditCardsService.listAll,
    staleTime: 5 * 60_000,
  })

  const createMutation = useMutation({
    mutationFn: ({ accountId, formData }: { accountId: string; formData: CreditCardFormData }) =>
      creditCardsService.create(accountId, formData),
    onSuccess: (card) => {
      queryClient.setQueryData<CreditCard[]>(CREDIT_CARDS_QUERY_KEY, (old = []) => [...old, card])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<CreditCardFormData> }) =>
      creditCardsService.update(id, formData),
    onSuccess: (card) => {
      queryClient.setQueryData<CreditCard[]>(CREDIT_CARDS_QUERY_KEY, (old = []) =>
        old.map((c) => (c.id === card.id ? card : c))
      )
    },
  })

  return {
    creditCards,
    loading: isLoading,
    create: (accountId: string, formData: CreditCardFormData) => createMutation.mutateAsync({ accountId, formData }),
    update: (id: string, formData: Partial<CreditCardFormData>) => updateMutation.mutateAsync({ id, formData }),
  }
}
