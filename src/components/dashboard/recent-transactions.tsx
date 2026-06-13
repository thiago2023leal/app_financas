'use client'

import Link from 'next/link'
import { Transaction } from '@/types'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Últimas transações</h3>
        <Link href="/transactions" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
          Ver todas <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
          Nenhuma transação encontrada
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }}
                />
                <div>
                  <p className="text-white text-sm font-medium line-clamp-1">{t.description}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.category} · {formatDate(t.date)}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ml-4 ${
                t.type === 'receita' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
