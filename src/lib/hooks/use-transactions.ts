'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/lib/services/transactions.service'
import { ACCOUNTS_QUERY_KEY } from '@/lib/hooks/use-accounts'
import type { Transaction, TransactionFormData, TransactionFilters } from '@/types'
import { toast } from 'sonner'

export const DASHBOARD_SUMMARY_KEY = ['dashboard-summary'] as const

export function useTransactions(filters: TransactionFilters) {
  const queryClient = useQueryClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await transactionsService.list(filters)
      setTransactions(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar transações.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const invalidateRelated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY })
  }, [queryClient])

  const create = useCallback(async (formData: TransactionFormData) => {
    const t = await transactionsService.create(formData)
    await load()
    invalidateRelated()
    return t
  }, [load, invalidateRelated])

  const update = useCallback(async (id: string, formData: TransactionFormData) => {
    const t = await transactionsService.update(id, formData)
    await load()
    invalidateRelated()
    return t
  }, [load, invalidateRelated])

  const remove = useCallback(async (id: string) => {
    await transactionsService.remove(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    invalidateRelated()
  }, [invalidateRelated])

  return { transactions, loading, error, create, update, remove, reload: load }
}

export function useDashboardSummary(month: number, year: number) {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: [...DASHBOARD_SUMMARY_KEY, month, year],
    queryFn: async () => {
      const [s, evo, recent] = await Promise.all([
        transactionsService.summary(month, year),
        transactionsService.monthlyEvolution(6),
        transactionsService.recentTransactions(month, year, 8),
      ])

      const expCat: Record<string, number> = {}
      const incCat: Record<string, number> = {}
      s.transactions.forEach((t: { type: string; category: string; amount: number }) => {
        if (t.type === 'despesa') expCat[t.category] = (expCat[t.category] ?? 0) + t.amount
        else incCat[t.category] = (incCat[t.category] ?? 0) + t.amount
      })

      return {
        summary: { totalIncome: s.totalIncome, totalExpenses: s.totalExpenses, balance: s.balance },
        expensesByCategory: Object.entries(expCat).map(([category, amount]) => ({ category, amount })),
        incomeByCategory: Object.entries(incCat).map(([category, amount]) => ({ category, amount })),
        recentTransactions: recent as Transaction[],
        evolution: evo,
      }
    },
    staleTime: 0,
  })

  useEffect(() => {
    if (isError) toast.error('Erro ao carregar resumo.')
  }, [isError])

  const reload = () => queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY })

  return {
    summary: data?.summary ?? { totalIncome: 0, totalExpenses: 0, balance: 0 },
    expensesByCategory: data?.expensesByCategory ?? [],
    incomeByCategory: data?.incomeByCategory ?? [],
    recentTransactions: data?.recentTransactions ?? [],
    evolution: data?.evolution ?? [],
    loading: isLoading,
    reload,
  }
}
