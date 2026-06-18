import type { Category, TransactionType } from './base'

export interface TransactionDraftPayload {
  description: string
  amount: number
  type: TransactionType
  category: Category
  date: string
  account_id: string
  account_name: string
}

export interface TransferDraftPayload {
  from_account_id: string
  from_account_name: string
  to_account_id: string
  to_account_name: string
  amount: number
  date: string
  description: string
}

export type AIDraft =
  | { kind: 'transaction'; confidence: number; payload: TransactionDraftPayload }
  | { kind: 'transfer'; confidence: number; payload: TransferDraftPayload }
