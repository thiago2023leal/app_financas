'use client'

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAccountHistory } from '@/lib/hooks/use-account-history'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownLeft, ArrowUp, ArrowDown, Inbox, Loader2 } from 'lucide-react'
import type { Account, AccountMovement } from '@/types'

interface AccountHistoryModalProps {
  account: Account | null
  onClose: () => void
}

export function AccountHistoryModal({ account, onClose }: AccountHistoryModalProps) {
  const { data: movements = [], isLoading } = useAccountHistory(account?.id ?? null)

  const grouped = useMemo(() => {
    const groups = new Map<string, AccountMovement[]>()
    for (const m of movements) {
      const list = groups.get(m.date) ?? []
      list.push(m)
      groups.set(m.date, list)
    }
    return Array.from(groups.entries())
  }, [movements])

  return (
    <Dialog open={!!account} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          'bg-slate-900 border-slate-800 text-white p-0 gap-0 flex flex-col',
          // Mobile: bottom sheet — fixo na base, ocupa a largura toda
          'fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0',
          'w-full max-w-full rounded-t-2xl rounded-b-none max-h-[85vh]',
          // Desktop: modal centralizado
          'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2',
          'sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:max-w-2xl sm:rounded-xl sm:max-h-[85vh]'
        )}
      >
        {account && (
          <>
            <DialogHeader className="p-5 pb-4 border-b border-slate-800 flex-shrink-0 space-y-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: account.color }}
                />
                <span className="truncate">{account.name}</span>
              </DialogTitle>
              <p className="text-2xl font-bold text-white">{formatCurrency(account.current_balance)}</p>
              <p className="text-slate-500 text-xs">Últimas 50 movimentações</p>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-5 py-3 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                </div>
              ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-1">
                    Ainda não existem movimentações nesta conta.
                  </p>
                  <p className="text-slate-600 text-xs">
                    Receitas, despesas e transferências aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {grouped.map(([date, items]) => (
                    <div key={date}>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
                        {formatDate(date)}
                      </p>
                      <div className="divide-y divide-slate-800/60">
                        {items.map((m) => (
                          <MovementRow key={m.id} movement={m} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function MovementRow({ movement }: { movement: AccountMovement }) {
  const isPositive = movement.kind === 'receita' || movement.kind === 'transfer_received'
  const sign = isPositive ? '+' : '−'

  const colorClass =
    movement.kind === 'receita' ? 'text-emerald-400'
    : movement.kind === 'despesa' ? 'text-red-400'
    : movement.kind === 'transfer_sent' ? 'text-amber-400'
    : 'text-blue-400'

  const bgClass =
    movement.kind === 'receita' ? 'bg-emerald-950/50 text-emerald-400'
    : movement.kind === 'despesa' ? 'bg-red-950/50 text-red-400'
    : movement.kind === 'transfer_sent' ? 'bg-amber-950/50 text-amber-400'
    : 'bg-blue-950/50 text-blue-400'

  const Icon =
    movement.kind === 'transfer_sent' ? ArrowUpRight
    : movement.kind === 'transfer_received' ? ArrowDownLeft
    : movement.kind === 'receita' ? ArrowUp
    : ArrowDown

  const subtitle = movement.counterpart
    ? `${movement.kind === 'transfer_sent' ? 'Para' : 'De'} ${movement.counterpart.name}`
    : movement.category

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', bgClass)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{movement.description}</p>
          {subtitle && <p className="text-slate-500 text-xs truncate">{subtitle}</p>}
        </div>
      </div>
      <p className={cn('text-sm font-semibold flex-shrink-0 whitespace-nowrap', colorClass)}>
        {sign} {formatCurrency(movement.amount)}
      </p>
    </div>
  )
}
