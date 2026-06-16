'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/lib/services/transactions.service'
import { ACCOUNTS_QUERY_KEY } from '@/lib/hooks/use-accounts'
import type { Transaction, TransactionFormData, TransactionFilters } from '@/types'
import { toast } from 'sonner'

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

  const create = useCallback(async (formData: TransactionFormData) => {
    const t = await transactionsService.create(formData)
    await load()
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    return t
  }, [load, queryClient])

  const update = useCallback(async (id: string, formData: TransactionFormData) => {
    const t = await transactionsService.update(id, formData)
    await load()
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    return t
  }, [load, queryClient])

  const remove = useCallback(async (id: string) => {
    await transactionsService.remove(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  }, [queryClient])

  return { transactions, loading, error, create, update, remove, reload: load }
}

export function useDashboardSummary(month: number, year: number) {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 })
  const [expensesByCategory, setExpensesByCategory] = useState<{ category: string; amount: number }[]>([])
  const [incomeByCategory, setIncomeByCategory] = useState<{ category: string; amount: number }[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [evolution, setEvolution] = useState<{ month: number; year: number; income: number; expenses: number; balance: number }[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [s, evo, recent] = await Promise.all([
        transactionsService.summary(month, year),
        transactionsService.monthlyEvolution(6),
        transactionsService.recentTransactions(month, year, 8),
      ])

      setSummary({ totalIncome: s.totalIncome, totalExpenses: s.totalExpenses, balance: s.balance })

      const expCat: Record<string, number> = {}
      const incCat: Record<string, number> = {}
      s.transactions.forEach((t: { type: string; category: string; amount: number }) => {
        if (t.type === 'despesa') expCat[t.category] = (expCat[t.category] ?? 0) + t.amount
        else incCat[t.category] = (incCat[t.category] ?? 0) + t.amount
      })
      setExpensesByCategory(Object.entries(expCat).map(([category, amount]) => ({ category, amount })))
      setIncomeByCategory(Object.entries(incCat).map(([category, amount]) => ({ category, amount })))
      setEvolution(evo)
      setRecentTransactions(recent)
    } catch {
      toast.error('Erro ao carregar resumo.')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  return { summary, expensesByCategory, incomeByCategory, recentTransactions, evolution, loading, reload: load }
}
