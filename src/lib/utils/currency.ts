export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(',', '.')) || 0
}
