import type { Category } from './base'

export interface Budget {
  id: string
  user_id: string
  category: Category
  month: number
  year: number
  amount: number
  created_at: string
}

export interface BudgetWithSpent extends Budget {
  spent: number
  remaining: number
  percentage: number
}

export interface BudgetFormData {
  category: Category
  amount: string
  month: number
  year: number
}
