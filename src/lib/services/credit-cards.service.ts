import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { CreditCard, CreditCardFormData } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

// Fase 3: só metadados (bandeira, limite, fechamento, vencimento).
// Nenhum cálculo de limite utilizado/disponível aqui — fica reservado
// para a Fase 6, quando toda a lógica financeira do cartão estiver pronta.
export const creditCardsService = {
  async listAll(): Promise<CreditCard[]> {
    const { data, error } = await supabase.from('credit_cards').select('*')
    if (error) throwPg(error)
    return data ?? []
  },

  async create(accountId: string, formData: CreditCardFormData): Promise<CreditCard> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        user_id: user.id,
        account_id: accountId,
        brand: formData.brand,
        limit_amount: parseCurrencyInput(formData.limit_amount),
        closing_day: Number(formData.closing_day),
        due_day: Number(formData.due_day),
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: Partial<CreditCardFormData>): Promise<CreditCard> {
    const updates: Record<string, unknown> = {}
    if (formData.brand !== undefined) updates.brand = formData.brand
    if (formData.limit_amount !== undefined) updates.limit_amount = parseCurrencyInput(formData.limit_amount)
    if (formData.closing_day !== undefined) updates.closing_day = Number(formData.closing_day)
    if (formData.due_day !== undefined) updates.due_day = Number(formData.due_day)

    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },
}
