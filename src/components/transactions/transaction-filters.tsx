'use client'

import { CATEGORIES, TransactionFilters } from '@/types'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  function update(partial: Partial<TransactionFilters>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por descrição..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
        />
        {filters.search && (
          <button
            onClick={() => update({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Month */}
      <select
        value={filters.month}
        onChange={(e) => update({ month: Number(e.target.value) })}
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors"
      >
        {MONTHS.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* Year */}
      <select
        value={filters.year}
        onChange={(e) => update({ year: Number(e.target.value) })}
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Category */}
      <select
        value={filters.category}
        onChange={(e) => update({ category: e.target.value as typeof filters.category })}
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors"
      >
        <option value="all">Todas categorias</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  )
}
