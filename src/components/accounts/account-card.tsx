'use client'

import { Account, ACCOUNT_TYPE_LABELS } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Wallet, Building2, PiggyBank, Smartphone, TrendingUp, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  carteira: Wallet,
  corrente: Building2,
  poupanca: PiggyBank,
  digital: Smartphone,
  investimentos: TrendingUp,
}

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const Icon = ACCOUNT_ICONS[account.type] ?? Wallet
  const isNegative = account.current_balance < 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: account.color + '20', borderColor: account.color + '40', border: '1px solid' }}
          >
            <Icon className="w-5 h-5" style={{ color: account.color }} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{account.name}</p>
            <p className="text-slate-500 text-xs">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(account)}
            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Editar conta"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(account)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Excluir conta"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div>
        <p className="text-slate-500 text-xs mb-1">Saldo atual</p>
        <p className={cn('text-xl font-bold', isNegative ? 'text-red-400' : 'text-white')}>
          {formatCurrency(account.current_balance)}
        </p>
        {account.initial_balance !== account.current_balance && (
          <p className="text-slate-600 text-xs mt-1">
            Inicial: {formatCurrency(account.initial_balance)}
          </p>
        )}
      </div>
    </div>
  )
}
