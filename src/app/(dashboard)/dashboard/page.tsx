'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction, DashboardSummary, CategorySummary } from '@/types'
import { CATEGORY_COLORS } from '@/lib/utils'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { PeriodSelector } from '@/components/dashboard/period-selector'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const supabase = createClient()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(year, month, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    setTransactions((data as Transaction[]) ?? [])
    setLoading(false)
  }, [month, year, supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const summary: DashboardSummary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'receita') acc.totalIncome += t.amount
      else acc.totalExpenses += t.amount
      acc.balance = acc.totalIncome - acc.totalExpenses
      return acc
    },
    { totalIncome: 0, totalExpenses: 0, balance: 0 }
  )

  const expensesByCategory: CategorySummary[] = Object.entries(
    transactions
      .filter((t) => t.type === 'despesa')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount
        return acc
      }, {})
  )
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0,
      color: CATEGORY_COLORS[category] ?? '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount)

  const incomeByCategory: CategorySummary[] = Object.entries(
    transactions
      .filter((t) => t.type === 'receita')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount
        return acc
      }, {})
  ).map(([category, amount]) => ({
    category,
    amount,
    percentage: summary.totalIncome > 0 ? (amount / summary.totalIncome) * 100 : 0,
    color: CATEGORY_COLORS[category] ?? '#94a3b8',
  }))

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl bg-slate-800" />
            <Skeleton className="h-80 rounded-xl bg-slate-800" />
          </div>
        </div>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={expensesByCategory} title="Despesas por categoria" />
            <CategoryChart data={incomeByCategory} title="Receitas por categoria" />
          </div>
          <RecentTransactions transactions={transactions.slice(0, 8)} />
        </>
      )}
    </div>
  )
}
