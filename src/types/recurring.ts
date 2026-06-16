import type { TransactionType, Category } from './base'

export type RecurringFrequency = 'semanal' | 'quinzenal' | 'mensal' | 'anual'

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  anual: 'Anual',
}

export interface RecurringTransaction {
  id: string
  user_id: string
  account_id?: string | null
  description: string
  amount: number
  type: TransactionType
  category: Category
  frequency: RecurringFrequency
  start_date: string
  end_date?: string | null
  next_due_date: string
  last_generated?: string | null
  active: boolean
  created_at: string
}

export interface RecurringFormData {
  description: string
  amount: string
  type: TransactionType
  category: Category
  frequency: RecurringFrequency
  start_date: string
  end_date?: string
  account_id?: string
}
