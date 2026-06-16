import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { Transfer, TransferFormData } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

export const transfersService = {
  async list(limit = 50): Promise<Transfer[]> {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throwPg(error)
    return data ?? []
  },

  async create(formData: TransferFormData): Promise<Transfer> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('transfers')
      .insert({
        user_id: user.id,
        from_account_id: formData.from_account_id,
        to_account_id: formData.to_account_id,
        amount: parseCurrencyInput(formData.amount),
        date: formData.date,
        description: formData.description.trim() || 'Transferência',
        notes: formData.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: Partial<TransferFormData>): Promise<Transfer> {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (formData.from_account_id !== undefined) updates.from_account_id = formData.from_account_id
    if (formData.to_account_id !== undefined)   updates.to_account_id   = formData.to_account_id
    if (formData.amount !== undefined)           updates.amount          = parseCurrencyInput(formData.amount)
    if (formData.date !== undefined)             updates.date            = formData.date
    if (formData.description !== undefined)      updates.description     = formData.description.trim() || 'Transferência'
    if (formData.notes !== undefined)            updates.notes           = formData.notes?.trim() || null

    const { data, error } = await supabase
      .from('transfers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('transfers').delete().eq('id', id)
    if (error) throwPg(error)
  },
}
