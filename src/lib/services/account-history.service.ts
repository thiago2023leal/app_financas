import { createClient } from '@/lib/supabase/client'
import type { AccountMovement } from '@/types'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao carregar histórico da conta.')
}

const HISTORY_LIMIT = 50

type TransactionRow = {
  id: string
  date: string
  created_at: string
  description: string
  amount: number
  type: 'receita' | 'despesa'
  category: string
}

type TransferRow = {
  id: string
  date: string
  created_at: string
  description: string
  amount: number
  from_account_id: string
  to_account_id: string
  from_account: { name: string; color: string } | null
  to_account: { name: string; color: string } | null
}

export const accountHistoryService = {
  // Merge em application level — sem migrations, sem RPC, sem VIEW.
  async listByAccount(accountId: string): Promise<AccountMovement[]> {
    const [txResult, transferResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('id, date, created_at, description, amount, type, category')
        .eq('account_id', accountId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT),
      supabase
        .from('transfers')
        .select(
          'id, date, created_at, description, amount, from_account_id, to_account_id, from_account:accounts!from_account_id(name,color), to_account:accounts!to_account_id(name,color)'
        )
        .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT),
    ])

    if (txResult.error) throwPg(txResult.error)
    if (transferResult.error) throwPg(transferResult.error)

    const txMovements: AccountMovement[] = ((txResult.data ?? []) as TransactionRow[]).map((t) => ({
      id: t.id,
      date: t.date,
      created_at: t.created_at,
      description: t.description,
      amount: t.amount,
      kind: t.type,
      category: t.category,
    }))

    const transferMovements: AccountMovement[] = ((transferResult.data ?? []) as unknown as TransferRow[]).map((tr) => {
      const isSent = tr.from_account_id === accountId
      const counterpartRaw = isSent ? tr.to_account : tr.from_account
      return {
        id: tr.id,
        date: tr.date,
        created_at: tr.created_at,
        description: tr.description,
        amount: tr.amount,
        kind: isSent ? 'transfer_sent' : 'transfer_received',
        counterpart: counterpartRaw ? { name: counterpartRaw.name, color: counterpartRaw.color } : undefined,
      }
    })

    return [...txMovements, ...transferMovements]
      .sort((a, b) =>
        b.date !== a.date ? b.date.localeCompare(a.date) : b.created_at.localeCompare(a.created_at)
      )
      .slice(0, HISTORY_LIMIT)
  },
}
