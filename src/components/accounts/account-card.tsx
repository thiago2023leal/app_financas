'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Account, ACCOUNT_TYPE_LABELS } from '@/types'
import type { OFAccountRecord } from '@/types/open-finance'
import { formatCurrency } from '@/lib/utils'
import { Wallet, Building2, PiggyBank, Smartphone, TrendingUp, CreditCard, Pencil, Trash2, RefreshCw, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  carteira: Wallet,
  corrente: Building2,
  poupanca: PiggyBank,
  digital: Smartphone,
  investimentos: TrendingUp,
  cartao: CreditCard,
}

interface AccountCardProps {
  account: Account
  ofAccount?: OFAccountRecord
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
  onViewHistory?: (account: Account) => void
}

export function AccountCard({ account, ofAccount, onEdit, onDelete, onViewHistory }: AccountCardProps) {
  const Icon = ACCOUNT_ICONS[account.type] ?? Wallet
  const isNegative = account.current_balance < 0
  const isBankNegative = ofAccount?.last_balance !== null && (ofAccount?.last_balance ?? 0) < 0

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
            <div className="flex items-center gap-1.5">
              <p className="text-white font-semibold text-sm">{account.name}</p>
              {ofAccount && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 leading-none">
                  OF
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onViewHistory && (
            <button
              onClick={() => onViewHistory(account)}
              className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Ver histórico de movimentações"
              title="Ver histórico"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          )}
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

      {/* Sem vínculo Open Finance: comportamento original */}
      {!ofAccount && (
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
      )}

      {/* Com vínculo Open Finance: dois saldos */}
      {ofAccount && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Saldo calculado</p>
            <p className={cn('text-sm font-semibold', isNegative ? 'text-red-400' : 'text-white')}>
              {formatCurrency(account.current_balance)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Saldo bancário</p>
            <p className={cn('text-xl font-bold', isBankNegative ? 'text-red-400' : 'text-emerald-400')}>
              {ofAccount.last_balance !== null ? formatCurrency(ofAccount.last_balance) : '—'}
            </p>
          </div>
          {ofAccount.last_sync && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800">
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <p className="text-slate-600 text-xs">
                {ofAccount.institution} · {formatDistanceToNow(new Date(ofAccount.last_sync), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
