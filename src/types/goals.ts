export type GoalStatus = 'active' | 'completed' | 'cancelled'

export interface Goal {
  id: string
  user_id: string
  account_id?: string | null
  name: string
  description?: string | null
  target_amount: number
  current_amount: number
  target_date?: string | null
  color: string
  icon: string
  status: GoalStatus
  created_at: string
}

export interface GoalFormData {
  name: string
  description?: string
  target_amount: string
  current_amount: string
  target_date?: string
  color: string
  icon: string
  account_id?: string
}
