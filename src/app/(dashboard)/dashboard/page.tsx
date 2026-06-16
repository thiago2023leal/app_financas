'use client'

import { useState } from 'react'
import { useDashboardSummary } from '@/lib/hooks/use-transactions'
import { CATEGORY_COLORS } from '@/lib/utils'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { PeriodSelector } from '@/components/dashboard/period-selector'
import { AccountsOverview } from '@/components/dashboard/accounts-overview'
import { EvolutionChart } from '@/components/dashboard/evolution-chart'
import { KPIIndicators } from '@/components/dashboard/kpi-indicators'
import { Skeleton } from '@/components/ui/skeleton'
import type { CategorySummary } from '@/types'

export default function DashboardPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { summary, expensesByCategory, incomeByCategory, recentTransactions, evolution, loading } =
    useDashboardSummary(month, year)

  const expCatSummary: CategorySummary[] = expensesByCategory
    .map(({ category, amount }) => ({
      category,
      amount,
      percentage: summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0,
      color: CATEGORY_COLORS[category] ?? '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount)

  const incCatSummary: CategorySummary[] = incomeByCategory
    .map(({ category, amount }) => ({
      category,
      amount,
      percentage: summary.totalIncome > 0 ? (amount / summary.totalIncome) * 100 : 0,
      color: CATEGORY_COLORS[category] ?? '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Visão geral das suas finanças</p>
        </div>
        <PeriodSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl bg-slate-800" />)}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-slate-800" />)}
          </div>
          <Skeleton className="h-32 rounded-xl bg-slate-800" />
          <Skeleton className="h-64 rounded-xl bg-slate-800" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 rounded-xl bg-slate-800" />
            <Skeleton className="h-72 rounded-xl bg-slate-800" />
          </div>
        </div>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <KPIIndicators evolution={evolution} />
          <AccountsOverview />
          <EvolutionChart data={evolution} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={expCatSummary} title="Despesas por categoria" />
            <CategoryChart data={incCatSummary} title="Receitas por categoria" />
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </>
      )}
    </div>
  )
}
