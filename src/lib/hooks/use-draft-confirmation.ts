'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useTransfers } from '@/lib/hooks/use-transfers'
import { ACCOUNTS_QUERY_KEY } from '@/lib/hooks/use-accounts'
import { DASHBOARD_SUMMARY_KEY } from '@/lib/hooks/use-transactions'
import { transactionsService } from '@/lib/services/transactions.service'
import type {
  AIDraft,
  TransactionDraftPayload,
  TransferDraftPayload,
  TransactionFormData,
  TransferFormData,
} from '@/types'

function transactionPayloadToFormData(payload: TransactionDraftPayload): TransactionFormData {
  return {
    description: payload.description,
    amount: String(payload.amount),
    type: payload.type,
    category: payload.category,
    date: payload.date,
    account_id: payload.account_id,
  }
}

function transferPayloadToFormData(payload: TransferDraftPayload): TransferFormData {
  return {
    from_account_id: payload.from_account_id,
    to_account_id: payload.to_account_id,
    amount: String(payload.amount),
    date: payload.date,
    description: payload.description,
  }
}

// Reutiliza as mesmas regras de negócio de transactionsService/useTransfers, sem montar
// useTransactions(filters) — que exigiria um fetch de lista irrelevante para o chat de IA.
export function useDraftConfirmation() {
  const queryClient = useQueryClient()
  const transfers = useTransfers()

  async function confirmDraft(draft: AIDraft): Promise<void> {
    if (draft.kind === 'transaction') {
      const formData = transactionPayloadToFormData(draft.payload)
      await transactionsService.create(formData)
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY })
    } else {
      const formData = transferPayloadToFormData(draft.payload)
      await transfers.create(formData)
    }
  }

  return { confirmDraft }
}
