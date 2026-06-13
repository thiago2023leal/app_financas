'use client'

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSummary } from '@/types'

interface SummaryCardsProps {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const { totalIncome, totalExpenses, balance } = summary
  const isPositive = balance >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm font-medium">Saldo</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isPositive ? 'bg-blue-950 border border-blue-900' : 'bg-orange-950 border border-orange-900'
          }`}>
            <Wallet className={`w-4 h-4 ${isPositive ? 'text-blue-400' : 'text-orange-400'}`} />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isPositive ? 'text-blue-400' : 'text-orange-400'}`}>
          {formatCurrency(balance)}
        </p>
        <p className="text-slate-500 text-xs mt-1">{isPositive ? 'Saldo positivo' : 'Saldo negativo'}</p>
      </div>
    </div>
  )
}
