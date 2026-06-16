export interface Transfer {
  id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  date: string
  description: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface TransferFormData {
  from_account_id: string
  to_account_id: string
  amount: string
  date: string
  description: string
  notes?: string
}
