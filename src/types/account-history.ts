export type AccountMovementKind = 'receita' | 'despesa' | 'transfer_sent' | 'transfer_received'

export interface AccountMovementCounterpart {
  name: string
  color: string
}

export interface AccountMovement {
  id: string
  date: string
  created_at: string
  description: string
  amount: number
  kind: AccountMovementKind
  category?: string
  counterpart?: AccountMovementCounterpart
}
