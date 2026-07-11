export type CreditCardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outros'

export const CREDIT_CARD_BRANDS: CreditCardBrand[] = [
  'visa',
  'mastercard',
  'elo',
  'amex',
  'hipercard',
  'outros',
]

export const CREDIT_CARD_BRAND_LABELS: Record<CreditCardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'American Express',
  hipercard: 'Hipercard',
  outros: 'Outros',
}

export interface CreditCard {
  id: string
  user_id: string
  account_id: string
  brand: CreditCardBrand
  limit_amount: number
  closing_day: number
  due_day: number
  active: boolean
  created_at: string
}

export interface CreditCardFormData {
  brand: CreditCardBrand
  limit_amount: string
  closing_day: string
  due_day: string
}
