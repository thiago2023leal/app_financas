import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
