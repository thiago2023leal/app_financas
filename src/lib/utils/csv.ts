import { Transaction } from '@/types'
import { formatDate } from './date'

export function exportToCSV(transactions: Transaction[], filename: string): void {
  const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']
  const rows = transactions.map((t) => [
    formatDate(t.date),
    `"${t.description.replace(/"/g, '""')}"`,
    t.type === 'receita' ? 'Receita' : 'Despesa',
    t.category,
    t.amount.toFixed(2).replace('.', ','),
  ])

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
