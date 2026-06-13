'use client'

import { Transaction } from '@/types'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface TransactionTableProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

export function TransactionTable({ transactions, loading, onEdit, onDelete }: TransactionTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-slate-800" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center py-20 text-slate-500 text-sm">
        Nenhuma transação encontrada para os filtros selecionados.
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-slate-400 font-medium px-5 py-3.5">Descrição</th>
              <th className="text-left text-slate-400 font-medium px-5 py-3.5">Categoria</th>
              <th className="text-left text-slate-400 font-medium px-5 py-3.5">Data</th>
              <th className="text-right text-slate-400 font-medium px-5 py-3.5">Valor</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }}
                    />
                    <span className="text-white font-medium">{t.description}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-slate-400 text-xs">{t.category}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(t.date)}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`font-semibold ${t.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(t)}
                      className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(t)}
                      className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-red-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden divide-y divide-slate-800">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }}
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{t.description}</p>
                <p className="text-slate-500 text-xs mt-0.5">{t.category} · {formatDate(t.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <span className={`text-sm font-semibold ${t.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(t)}
                className="w-7 h-7 text-slate-400 hover:text-white"
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(t)}
                className="w-7 h-7 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
