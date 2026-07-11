'use client'

import Link from 'next/link'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { formatCurrency } from '@/lib/utils'
import { Wallet, Building2, PiggyBank, Smartphone, TrendingUp, CreditCard, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { AccountType } from '@/types'

const ICONS: Record<AccountType, React.ElementType> = {
  carteira: Wallet,
  corrente: Building2,
  poupanca: PiggyBank,
  digital: Smartphone,
  investimentos: TrendingUp,
  cartao: CreditCard,
}

export function AccountsOverview() {
  const { accounts, loading, totalBalance } = useAccounts()

  if (loading) return <Skeleton className="h-28 rounded-xl bg-slate-800" />
  if (accounts.length === 0) return null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm">Patrimônio por conta</h2>
        <Link href="/accounts" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
          Ver todas <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.slice(0, 6).map((a) => {
          const Icon = ICONS[a.type] ?? Wallet
          return (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{a.name}</p>
                <p className={`text-sm font-semibold ${a.current_balance < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {formatCurrency(a.current_balance)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-slate-400 text-sm">Patrimônio total</span>
        <span className="text-white font-bold text-lg">{formatCurrency(totalBalance)}</span>
      </div>
    </div>
  )
}
