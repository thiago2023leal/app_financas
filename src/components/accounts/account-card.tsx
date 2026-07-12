'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Account, ACCOUNT_TYPE_LABELS, CreditCard, CREDIT_CARD_BRAND_LABELS } from '@/types'
import type { OFAccountRecord } from '@/types/open-finance'
import { useCreditCardInvoice } from '@/lib/hooks/use-credit-cards'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Wallet, Building2, PiggyBank, Smartphone, TrendingUp, CreditCard as CreditCardIcon, Pencil, Trash2, RefreshCw, History, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  carteira: Wallet,
  corrente: Building2,
  poupanca: PiggyBank,
  digital: Smartphone,
  investimentos: TrendingUp,
  cartao: CreditCardIcon,
}

interface AccountCardProps {
  account: Account
  ofAccount?: OFAccountRecord
  creditCard?: CreditCard | null
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
  onViewHistory?: (account: Account) => void
  onPayInvoice?: (account: Account, amount: number) => void
}

export function AccountCard({ account, ofAccount, creditCard, onEdit, onDelete, onViewHistory, onPayInvoice }: AccountCardProps) {
  const Icon = ACCOUNT_ICONS[account.type] ?? Wallet
  const isNegative = account.current_balance < 0
  const isBankNegative = ofAccount?.last_balance !== null && (ofAccount?.last_balance ?? 0) < 0

  const { data: invoice } = useCreditCardInvoice(
    creditCard ? account.id : null,
    creditCard ? account.current_balance : null,
    creditCard?.closing_day ?? null,
    creditCard?.due_day ?? null
  )

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

      {/* Cartão de crédito: metadados (Fase 3) — sem saldo/limite utilizado, reservado para a Fase 6 */}
      {account.type === 'cartao' && creditCard && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Bandeira</p>
            <span className="text-xs font-medium text-white bg-slate-800 px-2 py-0.5 rounded">
              {CREDIT_CARD_BRAND_LABELS[creditCard.brand]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">Limite total</p>
            <p className="text-white font-semibold text-sm">{formatCurrency(creditCard.limit_amount)}</p>
          </div>
          <div className="flex items-center gap-1 pt-1 border-t border-slate-800">
            <p className="text-slate-600 text-xs">Fecha dia {creditCard.closing_day} · Vence dia {creditCard.due_day}</p>
          </div>

          {invoice && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-slate-500 text-xs">Fatura atual</p>
                </div>
                <p className="text-white font-semibold text-sm">{formatCurrency(invoice.total)}</p>
              </div>
              <p className="text-slate-600 text-xs">Vence em {formatDate(invoice.dueDate)}</p>
              {invoice.total > 0 && onPayInvoice && (
                <button
                  onClick={() => onPayInvoice(account, invoice.total)}
                  className="w-full text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/50 rounded-lg py-1.5 transition-colors"
                >
                  Pagar fatura
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sem vínculo Open Finance: comportamento original */}
      {!(account.type === 'cartao' && creditCard) && !ofAccount && (
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
      {!(account.type === 'cartao' && creditCard) && ofAccount && (
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
