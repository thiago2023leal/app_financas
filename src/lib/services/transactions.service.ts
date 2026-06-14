import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { Transaction, TransactionFormData, TransactionFilters } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

export const transactionsService = {
  async list(filters: TransactionFilters): Promise<Transaction[]> {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0).toISOString().split('T')[0]

    let query = supabase
      .from('transactions')
      .select('*, account:accounts(id,name,color,icon,type)')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    if (filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters.account_id && filters.account_id !== 'all') {
      query = query.eq('account_id', filters.account_id)
    }
    if (filters.search.trim()) {
      query = query.ilike('description', `%${filters.search.trim()}%`)
    }

    const { data, error } = await query
    if (error) throwPg(error)
    return data ?? []
  },

  async create(formData: TransactionFormData): Promise<Transaction> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        description: formData.description.trim(),
        amount: parseCurrencyInput(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        account_id: formData.account_id || null,
        notes: formData.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: TransactionFormData): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        description: formData.description.trim(),
        amount: parseCurrencyInput(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        account_id: formData.account_id || null,
        notes: formData.notes?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throwPg(error)
  },

  async summary(month: number, year: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, category')
      .gte('date', start)
      .lte('date', end)

    if (error) throwPg(error)

    const txns = data ?? []
    const totalIncome = txns.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = txns.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0)

    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, transactions: txns }
  },

  async monthlyEvolution(months: number = 6) {
    const now = new Date()
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
    const start = `${firstMonth.getFullYear()}-${String(firstMonth.getMonth() + 1).padStart(2, '0')}-01`
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .gte('date', start)
      .lte('date', end)

    if (error) throwPg(error)

    const buckets: Record<string, { income: number; expenses: number; month: number; year: number }> = {}
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets[key] = { income: 0, expenses: 0, month: d.getMonth() + 1, year: d.getFullYear() }
    }

    for (const t of data ?? []) {
      const key = t.date.slice(0, 7)
      if (buckets[key]) {
        if (t.type === 'receita') buckets[key].income += t.amount
        else buckets[key].expenses += t.amount
      }
    }

    return Object.values(buckets).map((b) => ({
      month: b.month,
      year: b.year,
      income: b.income,
      expenses: b.expenses,
      balance: b.income - b.expenses,
    }))
  },

  async recentTransactions(month: number, year: number, limit = 8): Promise<Transaction[]> {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('*, account:accounts(id,name,color,icon,type)')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throwPg(error)
    return data ?? []
  },
}
