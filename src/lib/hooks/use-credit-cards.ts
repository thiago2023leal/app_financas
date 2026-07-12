'use client'

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { creditCardsService, getCurrentInvoice } from '@/lib/services/credit-cards.service'
import type { CreditCard, CreditCardFormData } from '@/types'

// Fase 5 (Opção B): cálculo síncrono, derivado de current_balance — não é
// mais uma consulta ao Supabase, então não existe cache próprio para
// invalidar. O valor já vem certo assim que account.current_balance muda
// (a invalidação de ACCOUNTS_QUERY_KEY que já existe depois de qualquer
// transaction/transfer cuida disso). Retorna o mesmo formato { data,
// isLoading } de uma query, propositalmente, para a Fase 10 poder trocar
// a implementação por uma consulta real a credit_card_invoices sem
// exigir mudança em quem consome este hook.
export function useCreditCardInvoice(
  accountId: string | null,
  currentBalance: number | null,
  closingDay: number | null,
  dueDay: number | null
) {
  const data = useMemo(() => {
    if (accountId == null || currentBalance == null || closingDay == null || dueDay == null) return undefined
    return getCurrentInvoice(accountId, currentBalance, closingDay, dueDay)
  }, [accountId, currentBalance, closingDay, dueDay])

  return { data, isLoading: false }
}

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
