'use client'

import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Receipt, ArrowLeftRight, Check, X } from 'lucide-react'
import type { AIDraft, DraftStatus } from '@/types'

interface DraftCardProps {
  draft: AIDraft
  status: DraftStatus
  onCancel: () => void
  onConfirm: () => void
}

export function DraftCard({ draft, status, onCancel, onConfirm }: DraftCardProps) {
  const isTransaction = draft.kind === 'transaction'
  const confidencePct = Math.round(draft.confidence * 100)

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        {isTransaction
          ? <Receipt className="w-4 h-4 text-blue-400 flex-shrink-0" />
          : <ArrowLeftRight className="w-4 h-4 text-blue-400 flex-shrink-0" />}
        <p className="text-white text-sm font-semibold">
          {isTransaction ? 'Despesa/Receita identificada' : 'Transferência identificada'}
        </p>
      </div>

      <div className="space-y-1.5 text-sm">
        {isTransaction ? (
          <>
            <FieldRow label="Conta" value={draft.payload.account_name} />
            <FieldRow label="Categoria" value={draft.payload.category} />
            <FieldRow label="Valor" value={formatCurrency(draft.payload.amount)} />
            <FieldRow label="Data" value={formatDate(draft.payload.date)} />
            <FieldRow label="Descrição" value={draft.payload.description} />
          </>
        ) : (
          <>
            <FieldRow label="Origem" value={draft.payload.from_account_name} />
            <FieldRow label="Destino" value={draft.payload.to_account_name} />
            <FieldRow label="Valor" value={formatCurrency(draft.payload.amount)} />
            <FieldRow label="Data" value={formatDate(draft.payload.date)} />
            <FieldRow label="Descrição" value={draft.payload.description} />
          </>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Confiança</span>
          <span>{confidencePct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn('h-full rounded-full', confidencePct >= 90 ? 'bg-emerald-500' : 'bg-amber-500')}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
          >
            Confirmar
          </Button>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex items-center gap-1.5 text-slate-500 text-xs pt-1">
          <X className="w-3.5 h-3.5" />
          Cancelado
        </div>
      )}

      {status === 'confirmed' && (
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs pt-1">
          <Check className="w-3.5 h-3.5" />
          Confirmado
        </div>
      )}
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-white text-right truncate">{value}</span>
    </div>
  )
}
