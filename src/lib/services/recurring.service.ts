import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { RecurringTransaction, RecurringFormData } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'
import { todayISO } from '@/lib/utils/date'
import { addWeeks, addDays, addMonths, addYears, parseISO, format } from 'date-fns'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

function nextDueDate(current: string, frequency: string): string {
  const date = parseISO(current)
  let next: Date
  switch (frequency) {
    case 'semanal':   next = addWeeks(date, 1); break
    case 'quinzenal': next = addDays(date, 15); break
    case 'mensal':    next = addMonths(date, 1); break
    case 'anual':     next = addYears(date, 1); break
    default:          next = addMonths(date, 1)
  }
  return format(next, 'yyyy-MM-dd')
}

export const recurringService = {
  async list(): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throwPg(error)
    return data ?? []
  },

  async create(formData: RecurringFormData): Promise<RecurringTransaction> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: user.id,
        description: formData.description,
        amount: parseCurrencyInput(formData.amount),
        type: formData.type,
        category: formData.category,
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        next_due_date: formData.start_date,
        account_id: formData.account_id || null,
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: Partial<RecurringFormData>): Promise<RecurringTransaction> {
    const updates: Record<string, unknown> = {}
    if (formData.description !== undefined) updates.description = formData.description
    if (formData.amount !== undefined) updates.amount = parseCurrencyInput(formData.amount)
    if (formData.type !== undefined) updates.type = formData.type
    if (formData.category !== undefined) updates.category = formData.category
    if (formData.frequency !== undefined) updates.frequency = formData.frequency
    if (formData.end_date !== undefined) updates.end_date = formData.end_date || null
    if (formData.account_id !== undefined) updates.account_id = formData.account_id || null

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async toggle(id: string, active: boolean): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ active })
      .eq('id', id)

    if (error) throwPg(error)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
    if (error) throwPg(error)
  },

  // Confirma o pagamento de UMA ocorrência — vencida, vencendo hoje ou
  // antecipada (next_due_date no futuro) — e lança a transação real (mesmo
  // caminho usado por um lançamento manual). Nada é escrito em `transactions`
  // antes desta confirmação explícita: a data de vencimento é só informativa,
  // nunca bloqueia a confirmação. A transação é sempre datada com o dia da
  // confirmação (data real do pagamento), independentemente de next_due_date.
  async confirmPayment(id: string): Promise<RecurringTransaction> {
    const user = await getAuthUser()

    const { data: rec, error: fetchErr } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr) throwPg(fetchErr)
    if (!rec.active) throw new Error('Recorrência está pausada.')
    if (rec.end_date && rec.next_due_date > rec.end_date) {
      throw new Error('Recorrência já encerrada.')
    }

    const { error: insertErr } = await supabase.from('transactions').insert({
      user_id: user.id,
      description: rec.description,
      amount: rec.amount,
      type: rec.type,
      category: rec.category,
      date: todayISO(),
      account_id: rec.account_id,
      is_recurring: true,
    })

    if (insertErr) throwPg(insertErr)

    const next = nextDueDate(rec.next_due_date, rec.frequency)
    const { data: updated, error: updateErr } = await supabase
      .from('recurring_transactions')
      .update({ next_due_date: next, last_generated: rec.next_due_date })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throwPg(updateErr)
    return updated
  },
}
