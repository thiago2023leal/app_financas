'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Percent, Wallet } from 'lucide-react'

interface KPIProps {
  evolution: { income: number; expenses: number; balance: number }[]
}

export function KPIIndicators({ evolution }: KPIProps) {
  if (evolution.length === 0) return null

  const avgIncome = evolution.reduce((s, d) => s + d.income, 0) / evolution.length
  const avgExpenses = evolution.reduce((s, d) => s + d.expenses, 0) / evolution.length
  const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0

  const last = evolution[evolution.length - 1]
  const prev = evolution[evolution.length - 2]
  const balanceGrowth = prev && prev.balance !== 0
    ? ((last.balance - prev.balance) / Math.abs(prev.balance)) * 100
    : 0

  const kpis = [
    { label: 'Receita média', value: formatCurrency(avgIncome), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Despesa média', value: formatCurrency(avgExpenses), icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Taxa de economia', value: `${savingsRate.toFixed(1)}%`, icon: Percent, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Crescimento (mês)', value: `${balanceGrowth >= 0 ? '+' : ''}${balanceGrowth.toFixed(1)}%`, icon: Wallet, color: balanceGrowth >= 0 ? 'text-emerald-400' : 'text-red-400', bg: balanceGrowth >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-slate-500 text-xs mb-1">{label}</p>
          <p className={`font-bold text-base ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
