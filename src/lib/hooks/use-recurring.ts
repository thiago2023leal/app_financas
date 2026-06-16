'use client'

import { useState, useEffect, useCallback } from 'react'
import { recurringService } from '@/lib/services/recurring.service'
import type { RecurringTransaction, RecurringFormData } from '@/types'
import { toast } from 'sonner'

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recurringService.list()
      setRecurring(data)
    } catch {
      toast.error('Erro ao carregar recorrentes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (formData: RecurringFormData) => {
    const rec = await recurringService.create(formData)
    setRecurring((prev) => [rec, ...prev])
    return rec
  }, [])

  const update = useCallback(async (id: string, formData: Partial<RecurringFormData>) => {
    const rec = await recurringService.update(id, formData)
    setRecurring((prev) => prev.map((r) => (r.id === id ? rec : r)))
    return rec
  }, [])

  const toggle = useCallback(async (id: string, active: boolean) => {
    await recurringService.toggle(id, active)
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)))
  }, [])

  const remove = useCallback(async (id: string) => {
    await recurringService.remove(id)
    setRecurring((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const processDue = useCallback(async () => {
    const count = await recurringService.processDue()
    if (count > 0) {
      toast.success(`${count} transação(ões) recorrente(s) gerada(s).`)
      await load()
    }
    return count
  }, [load])

  const activeCount = recurring.filter((r) => r.active).length

  return { recurring, loading, create, update, toggle, remove, processDue, reload: load, activeCount }
}
