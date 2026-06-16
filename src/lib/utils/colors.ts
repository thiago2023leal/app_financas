export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: '#f97316',
  Transporte: '#3b82f6',
  Moradia: '#8b5cf6',
  Lazer: '#ec4899',
  Saúde: '#10b981',
  Educação: '#06b6d4',
  Salário: '#22c55e',
  Freelance: '#a855f7',
  Outros: '#94a3b8',
}

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  carteira: '#f59e0b',
  corrente: '#3b82f6',
  poupanca: '#22c55e',
  digital: '#8b5cf6',
  investimentos: '#06b6d4',
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#94a3b8'
}
