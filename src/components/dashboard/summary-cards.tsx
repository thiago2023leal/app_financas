'use client'

import { TrendingUp, TrendingDown, Landmark } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSummary } from '@/types'

interface SummaryCardsProps {
  summary: DashboardSummary
  totalBalance: number
}

export function SummaryCards({ summary, totalBalance }: SummaryCardsProps) {
  const { totalIncome, totalExpenses } = summary
  const isNegative = totalBalance < 0

  return (
    <div className="space-y-4">
      {/* Patrimônio Total — destaque principal */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">Patrimônio Total</span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <p className={`text-4xl font-bold tracking-tight ${isNegative ? 'text-red-400' : 'text-white'}`}>
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-slate-500 text-xs mt-2">Soma dos saldos atuais das contas</p>
      </div>

      {/* Receitas e Despesas do período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Receitas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          <p className="text-slate-500 text-xs mt-1">Total do período</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Despesas</span>
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-900 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          <p className="text-slate-500 text-xs mt-1">Total do período</p>
        </div>
      </div>
    </div>
  )
}
