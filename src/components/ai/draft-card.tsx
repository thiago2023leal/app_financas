'use client'

import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Receipt, ArrowLeftRight, Check, X, AlertTriangle, Loader2 } from 'lucide-react'
import { DraftEditForm } from '@/components/ai/draft-edit-form'
import type { AIDraft, DraftStatus, Account, TransactionDraftPayload, TransferDraftPayload } from '@/types'

interface DraftCardProps {
  draft: AIDraft
  status: DraftStatus
  errorMessage?: string
  accounts: Account[]
  isEditing: boolean
  onCancel: () => void
  onConfirm: () => void
  onRetry: () => void
  onStartEdit: () => void
  onSaveEdit: (payload: TransactionDraftPayload | TransferDraftPayload) => void
  onCancelEdit: () => void
}

export function DraftCard({
  draft, status, errorMessage, accounts, isEditing,
  onCancel, onConfirm, onRetry, onStartEdit, onSaveEdit, onCancelEdit,
}: DraftCardProps) {
  const isTransaction = draft.kind === 'transaction'
  const confidencePct = Math.round(draft.confidence * 100)
  const showEditForm = status === 'pending' && isEditing

  const successLabel = draft.kind === 'transaction'
    ? (draft.payload.type === 'receita' ? 'Receita registrada com sucesso' : 'Despesa registrada com sucesso')
    : 'Transferência registrada com sucesso'

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        {isTransaction
          ? <Receipt className="w-4 h-4 text-blue-400 flex-shrink-0" />
          : <ArrowLeftRight className="w-4 h-4 text-blue-400 flex-shrink-0" />}
        <p className="text-white text-sm font-semibold">
          {isTransaction ? 'Despesa/Receita identificada' : 'Transferência identificada'}
          {showEditForm && <span className="text-slate-500 font-normal"> · editando</span>}
        </p>
      </div>

      {showEditForm ? (
        <DraftEditForm draft={draft} accounts={accounts} onSave={onSaveEdit} onCancel={onCancelEdit} />
      ) : (
        <>
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
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 sm:flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onStartEdit}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 sm:flex-1"
                >
                  Editar
                </Button>
              </div>
              <Button
                type="button"
                onClick={onConfirm}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white sm:w-auto sm:flex-1"
              >
                Confirmar
              </Button>
            </div>
          )}

          {status === 'executing' && (
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" disabled className="flex-1 border-slate-700 text-slate-500">
                Cancelar
              </Button>
              <Button type="button" disabled className="flex-1 bg-blue-600/60 text-white gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirmando...
              </Button>
            </div>
          )}

          {status === 'confirmed' && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs pt-1">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              {successLabel}
            </div>
          )}

          {status === 'cancelled' && (
            <div className="flex items-center gap-1.5 text-slate-500 text-xs pt-1">
              <X className="w-3.5 h-3.5 flex-shrink-0" />
              Cancelado
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-1.5 text-red-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Erro ao registrar{errorMessage ? `: ${errorMessage}` : '.'}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </>
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
