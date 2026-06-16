'use client'

import { useState, useEffect, useCallback } from 'react'
import { goalsService } from '@/lib/services/goals.service'
import type { Goal, GoalFormData } from '@/types'
import { toast } from 'sonner'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await goalsService.list()
      setGoals(data)
    } catch {
      toast.error('Erro ao carregar metas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (formData: GoalFormData) => {
    const goal = await goalsService.create(formData)
    setGoals((prev) => [goal, ...prev])
    return goal
  }, [])

  const update = useCallback(async (id: string, formData: Partial<GoalFormData>) => {
    const goal = await goalsService.update(id, formData)
    setGoals((prev) => prev.map((g) => (g.id === id ? goal : g)))
    return goal
  }, [])

  const updateProgress = useCallback(async (id: string, amount: number) => {
    const goal = await goalsService.updateProgress(id, amount)
    setGoals((prev) => prev.map((g) => (g.id === id ? goal : g)))
    return goal
  }, [])

  const complete = useCallback(async (id: string) => {
    await goalsService.complete(id)
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'completed' as const } : g))
    )
  }, [])

  const remove = useCallback(async (id: string) => {
    await goalsService.remove(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  return { goals, loading, create, update, updateProgress, complete, remove, reload: load }
}
