export type TransactionType = 'receita' | 'despesa'

export type Category =
  | 'Alimentação'
  | 'Transporte'
  | 'Moradia'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Salário'
  | 'Freelance'
  | 'Outros'

export const CATEGORIES: Category[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Freelance',
  'Outros',
]

export const INCOME_CATEGORIES: Category[] = ['Salário', 'Freelance', 'Outros']
export const EXPENSE_CATEGORIES: Category[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Outros',
]

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: TransactionType
  category: Category
  date: string
  created_at: string
  updated_at: string
}

export interface TransactionFormData {
  description: string
  amount: string
  type: TransactionType
  category: Category
  date: string
}

export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export interface CategorySummary {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface TransactionFilters {
  month: number
  year: number
  category: Category | 'all'
  search: string
}
