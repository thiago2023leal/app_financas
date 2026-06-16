import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { Account, AccountFormData } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

export const accountsService = {
  async list(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (error) throwPg(error)
    return data ?? []
  },

  async create(formData: AccountFormData): Promise<Account> {
    const user = await getAuthUser()
    const balance = parseCurrencyInput(formData.initial_balance)
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        initial_balance: balance,
        current_balance: balance,
        color: formData.color,
        icon: formData.icon,
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: Partial<AccountFormData>): Promise<Account> {
    const updates: Record<string, unknown> = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      icon: formData.icon,
    }
    const balanceChanged = formData.initial_balance !== undefined
    if (balanceChanged) {
      updates.initial_balance = parseCurrencyInput(formData.initial_balance!)
    }

    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)

    if (balanceChanged) {
      await accountsService.recalculateBalance(id)
    }

    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ active: false })
      .eq('id', id)

    if (error) throwPg(error)
  },

  async recalculateBalance(id: string): Promise<void> {
    const { data: account, error: accErr } = await supabase
      .from('accounts')
      .select('initial_balance')
      .eq('id', id)
      .single()

    if (accErr) throwPg(accErr)

    const { data: txns, error: txErr } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('account_id', id)

    if (txErr) throwPg(txErr)

    const delta = (txns ?? []).reduce((sum, t) => {
      return t.type === 'receita' ? sum + t.amount : sum - t.amount
    }, 0)

    const { error } = await supabase
      .from('accounts')
      .update({ current_balance: account!.initial_balance + delta })
      .eq('id', id)

    if (error) throwPg(error)
  },
}
