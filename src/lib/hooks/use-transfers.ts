'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { transfersService } from '@/lib/services/transfers.service'
import { ACCOUNTS_QUERY_KEY } from '@/lib/hooks/use-accounts'
import { DASHBOARD_SUMMARY_KEY } from '@/lib/hooks/use-transactions'
import type { TransferFormData } from '@/types'
import { toast } from 'sonner'

export function useTransfers() {
  const queryClient = useQueryClient()

  const invalidateRelated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY })
  }, [queryClient])

  const create = useCallback(async (formData: TransferFormData) => {
    try {
      const t = await transfersService.create(formData)
      invalidateRelated()
      return t
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar transferência.'
      toast.error(msg)
      throw err
    }
  }, [invalidateRelated])

  const update = useCallback(async (id: string, formData: Partial<TransferFormData>) => {
    try {
      const t = await transfersService.update(id, formData)
      invalidateRelated()
      return t
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar transferência.'
      toast.error(msg)
      throw err
    }
  }, [invalidateRelated])

  const remove = useCallback(async (id: string) => {
    try {
      await transfersService.remove(id)
      invalidateRelated()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir transferência.'
      toast.error(msg)
      throw err
    }
  }, [invalidateRelated])

  return { create, update, remove }
}
