import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { Budget, BudgetFormData, BudgetWithSpent } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

export const budgetsService = {
  async listWithSpent(month: number, year: number): Promise<BudgetWithSpent[]> {
    const { data: budgets, error: bErr } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', month)
      .eq('year', year)

    if (bErr) throwPg(bErr)
    if (!budgets || budgets.length === 0) return []

    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: txns, error: tErr } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'despesa')
      .gte('date', start)
      .lte('date', end)

    if (tErr) throwPg(tErr)

    const spentByCategory: Record<string, number> = {}
    ;(txns ?? []).forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + t.amount
    })

    return budgets.map((b) => {
      const spent = spentByCategory[b.category] ?? 0
      const remaining = b.amount - spent
      const percentage = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0
      return { ...b, spent, remaining, percentage }
    })
  },

  async upsert(formData: BudgetFormData): Promise<Budget> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          category: formData.category,
          amount: parseCurrencyInput(formData.amount),
          month: formData.month,
          year: formData.year,
        },
        { onConflict: 'user_id,category,month,year' }
      )
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throwPg(error)
  },
}
