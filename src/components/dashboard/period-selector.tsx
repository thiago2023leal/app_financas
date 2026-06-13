'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear } from '@/lib/utils'

interface PeriodSelectorProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
}

export function PeriodSelector({ month, year, onChange }: PeriodSelectorProps) {
  function prev() {
    if (month === 1) onChange(12, year - 1)
    else onChange(month - 1, year)
  }

  function next() {
    if (month === 12) onChange(1, year + 1)
    else onChange(month + 1, year)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-white font-medium text-sm min-w-32 text-center capitalize">
        {formatMonthYear(month, year)}
      </span>
      <button
        onClick={next}
        className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
