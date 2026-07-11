export type AccountType = 'carteira' | 'corrente' | 'poupanca' | 'digital' | 'investimentos' | 'cartao'

export const ACCOUNT_TYPES: AccountType[] = [
  'carteira',
  'corrente',
  'poupanca',
  'digital',
  'investimentos',
  'cartao',
]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  carteira: 'Carteira',
  corrente: 'Conta Corrente',
  poupanca: 'Poupança',
  digital: 'Conta Digital',
  investimentos: 'Investimentos',
  cartao: 'Cartão de Crédito',
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  initial_balance: number
  current_balance: number
  color: string
  icon: string
  active: boolean
  created_at: string
}

export interface AccountFormData {
  name: string
  type: AccountType
  initial_balance: string
  color: string
  icon: string
}
