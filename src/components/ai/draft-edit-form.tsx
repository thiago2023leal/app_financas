'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, parseCurrencyInput } from '@/lib/utils'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types'
import type {
  AIDraft,
  Account,
  TransactionDraftPayload,
  TransferDraftPayload,
  TransactionType,
  Category,
} from '@/types'

interface DraftEditFormProps {
  draft: AIDraft
  accounts: Account[]
  onSave: (payload: TransactionDraftPayload | TransferDraftPayload) => void
  onCancel: () => void
}

export function DraftEditForm({ draft, accounts, onSave, onCancel }: DraftEditFormProps) {
  if (draft.kind === 'transaction') {
    return <TransactionEditFields draft={draft} accounts={accounts} onSave={onSave} onCancel={onCancel} />
  }
  return <TransferEditFields draft={draft} accounts={accounts} onSave={onSave} onCancel={onCancel} />
}

function AccountSelect({
  value, onChange, accounts, label,
}: { value: string; onChange: (id: string) => void; accounts: Account[]; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-300 text-sm">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
      >
        <option value="" disabled>Selecione…</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
    </div>
  )
}

function EditFormButtons({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex gap-2 pt-1">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        Cancelar edição
      </Button>
      <Button
        type="button"
        onClick={onSave}
        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
      >
        Salvar alterações
      </Button>
    </div>
  )
}

function TransactionEditFields({
  draft, accounts, onSave, onCancel,
}: {
  draft: Extract<AIDraft, { kind: 'transaction' }>
  accounts: Account[]
  onSave: (payload: TransactionDraftPayload) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<TransactionType>(draft.payload.type)
  const [category, setCategory] = useState<Category>(draft.payload.category)
  const [accountId, setAccountId] = useState(draft.payload.account_id)
  const [amount, setAmount] = useState(String(draft.payload.amount).replace('.', ','))
  const [date, setDate] = useState(draft.payload.date)
  const [description, setDescription] = useState(draft.payload.description)
  const [error, setError] = useState<string | null>(null)

  const categories = type === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function updateType(next: TransactionType) {
    setType(next)
    const cats = next === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    if (!cats.includes(category)) setCategory(cats[0])
  }

  function handleSave() {
    const parsedAmount = parseCurrencyInput(amount)
    if (!(parsedAmount > 0)) { setError('Informe um valor maior que zero.'); return }
    if (!accountId) { setError('Selecione uma conta.'); return }
    const account = accounts.find((a) => a.id === accountId)
    if (!account) { setError('Conta selecionada não é válida.'); return }
    if (!date || isNaN(new Date(date).getTime())) { setError('Informe uma data válida.'); return }
    if (!description.trim()) { setError('Informe uma descrição.'); return }

    setError(null)
    onSave({
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      account_id: account.id,
      account_name: account.name,
    })
  }

  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-lg">
        {(['despesa', 'receita'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => updateType(t)}
            className={cn(
              'py-2 rounded-md text-sm font-medium transition-colors',
              type === t
                ? t === 'receita' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            )}
          >
            {t === 'receita' ? 'Receita' : 'Despesa'}
          </button>
        ))}
      </div>

      <AccountSelect value={accountId} onChange={setAccountId} accounts={accounts} label="Conta" />

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Categoria</Label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                category === cat
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Valor (R$)</Label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Data</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white focus:border-blue-500 h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Descrição</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={100}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-10"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <EditFormButtons onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

function TransferEditFields({
  draft, accounts, onSave, onCancel,
}: {
  draft: Extract<AIDraft, { kind: 'transfer' }>
  accounts: Account[]
  onSave: (payload: TransferDraftPayload) => void
  onCancel: () => void
}) {
  const [fromId, setFromId] = useState(draft.payload.from_account_id)
  const [toId, setToId] = useState(draft.payload.to_account_id)
  const [amount, setAmount] = useState(String(draft.payload.amount).replace('.', ','))
  const [date, setDate] = useState(draft.payload.date)
  const [description, setDescription] = useState(draft.payload.description)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const parsedAmount = parseCurrencyInput(amount)
    if (!(parsedAmount > 0)) { setError('Informe um valor maior que zero.'); return }
    if (!fromId || !toId) { setError('Selecione as contas de origem e destino.'); return }
    if (fromId === toId) { setError('Selecione contas diferentes.'); return }
    const fromAccount = accounts.find((a) => a.id === fromId)
    const toAccount = accounts.find((a) => a.id === toId)
    if (!fromAccount || !toAccount) { setError('Conta selecionada não é válida.'); return }
    if (!date || isNaN(new Date(date).getTime())) { setError('Informe uma data válida.'); return }

    setError(null)
    onSave({
      from_account_id: fromAccount.id,
      from_account_name: fromAccount.name,
      to_account_id: toAccount.id,
      to_account_name: toAccount.name,
      amount: parsedAmount,
      date,
      description: description.trim() || 'Transferência',
    })
  }

  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AccountSelect value={fromId} onChange={setFromId} accounts={accounts} label="Origem" />
        <AccountSelect value={toId} onChange={setToId} accounts={accounts} label="Destino" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Valor (R$)</Label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Data</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white focus:border-blue-500 h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Descrição</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={100}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-10"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <EditFormButtons onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}
