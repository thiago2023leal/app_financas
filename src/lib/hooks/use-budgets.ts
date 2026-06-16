'use client'

import { useState, useEffect, useCallback } from 'react'
import { budgetsService } from '@/lib/services/budgets.service'
import type { BudgetFormData, BudgetWithSpent } from '@/types'
import { toast } from 'sonner'

export function useBudgets(month: number, year: number) {
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await budgetsService.listWithSpent(month, year)
      setBudgets(data)
    } catch {
      toast.error('Erro ao carregar orçamentos.')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  const upsert = useCallback(async (formData: BudgetFormData) => {
    const budget = await budgetsService.upsert(formData)
    await load()
    return budget
  }, [load])

  const remove = useCallback(async (id: string) => {
    await budgetsService.remove(id)
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const overBudget = budgets.filter((b) => b.percentage >= 100)

  return { budgets, loading, upsert, remove, reload: load, totalBudgeted, totalSpent, overBudget }
}
