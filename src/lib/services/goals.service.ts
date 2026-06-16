import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { Goal, GoalFormData } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

export const goalsService = {
  async list(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throwPg(error)
    return data ?? []
  },

  async create(formData: GoalFormData): Promise<Goal> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        target_amount: parseCurrencyInput(formData.target_amount),
        current_amount: parseCurrencyInput(formData.current_amount),
        target_date: formData.target_date || null,
        color: formData.color,
        icon: formData.icon,
        account_id: formData.account_id || null,
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: Partial<GoalFormData>): Promise<Goal> {
    const updates: Record<string, unknown> = {}
    if (formData.name !== undefined) updates.name = formData.name
    if (formData.description !== undefined) updates.description = formData.description
    if (formData.target_amount !== undefined) updates.target_amount = parseCurrencyInput(formData.target_amount)
    if (formData.current_amount !== undefined) updates.current_amount = parseCurrencyInput(formData.current_amount)
    if (formData.target_date !== undefined) updates.target_date = formData.target_date || null
    if (formData.color !== undefined) updates.color = formData.color
    if (formData.icon !== undefined) updates.icon = formData.icon
    if (formData.account_id !== undefined) updates.account_id = formData.account_id || null

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async updateProgress(id: string, amount: number): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({ current_amount: amount })
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async complete(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .update({ status: 'completed' })
      .eq('id', id)

    if (error) throwPg(error)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throwPg(error)
  },
}
