import type { Account } from './accounts'
import type { Category, TransactionType } from './base'

// ─── Base primitives ─────────────────────────────────────────────────────────
export {
  CATEGORIES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from './base'
export type { TransactionType, Category } from './base'

// ─── Account ─────────────────────────────────────────────────────────────────
export type { Account, AccountFormData, AccountType } from './accounts'
export { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from './accounts'

// ─── Goal ────────────────────────────────────────────────────────────────────
export type { Goal, GoalFormData, GoalStatus } from './goals'

// ─── Budget ──────────────────────────────────────────────────────────────────
export type { Budget, BudgetFormData, BudgetWithSpent } from './budgets'

// ─── Recurring ───────────────────────────────────────────────────────────────
export type { RecurringTransaction, RecurringFormData, RecurringFrequency } from './recurring'
export { RECURRING_FREQUENCY_LABELS } from './recurring'

// ─── Open Finance ────────────────────────────────────────────────────────────
export type {
  OFProviderSlug,
  OFProvider,
  OFConnection,
  OFAccount,
  OFAccountRecord,
  OFTransaction,
} from './open-finance'

// ─── Transfer ─────────────────────────────────────────────────────────────────
export type { Transfer, TransferFormData } from './transfers'

// ─── Transaction ─────────────────────────────────────────────────────────────
export interface Transaction {
  id: string
  user_id: string
  account_id?: string | null
  description: string
  amount: number
  type: TransactionType
  category: Category
  date: string
  notes?: string | null
  is_recurring?: boolean
  created_at: string
  updated_at: string
  account?: Account
}

export interface TransactionFormData {
  description: string
  amount: string
  type: TransactionType
  category: Category
  date: string
  account_id?: string
  notes?: string
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
  account_id?: string | 'all'
}
