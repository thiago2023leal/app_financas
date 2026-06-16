'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Loader2, ArrowRight } from 'lucide-react'
import { todayISO } from '@/lib/utils/date'
import type { Account, TransferFormData } from '@/types'

interface TransferFormProps {
  open: boolean
  accounts: Account[]
  onClose: () => void
  onSubmit: (data: TransferFormData) => Promise<void>
}

const DEFAULT_FORM: TransferFormData = {
  from_account_id: '',
  to_account_id: '',
  amount: '',
  date: todayISO(),
  description: 'Transferência',
  notes: '',
}

function AccountTriggerContent({ account }: { account: Account | undefined }) {
  if (!account) {
    return <span className="text-slate-500 text-sm">Selecione…</span>
  }
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: account.color }}
      />
      <span className="truncate text-sm">{account.name}</span>
    </div>
  )
}

export function TransferForm({ open, accounts, onClose, onSubmit }: TransferFormProps) {
  const [form, setForm] = useState<TransferFormData>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [sameAccountError, setSameAccountError] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(DEFAULT_FORM)
    setSameAccountError(false)
  }, [open])

  function set<K extends keyof TransferFormData>(key: K, value: TransferFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'from_account_id' || key === 'to_account_id') {
        const from = key === 'from_account_id' ? value : prev.from_account_id
        const to   = key === 'to_account_id'   ? value : prev.to_account_id
        setSameAccountError(Boolean(from && to && from === to))
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.from_account_id || !form.to_account_id) return
    if (form.from_account_id === form.to_account_id) {
      setSameAccountError(true)
      return
    }

    const amount = parseFloat(form.amount.replace(',', '.'))
    if (!amount || amount <= 0) return

    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const fromAccount = accounts.find((a) => a.id === form.from_account_id)
  const toAccount   = accounts.find((a) => a.id === form.to_account_id)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Nova transferência</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">

          {/* Origem / Destino — coluna única no mobile, lado a lado no desktop */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-2">

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Origem</Label>
              <Select
                value={form.from_account_id}
                onValueChange={(v) => { if (v) set('from_account_id', v) }}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-11">
                  <AccountTriggerContent account={fromAccount} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {accounts.map((a) => (
                    <SelectItem
                      key={a.id}
                      value={a.id}
                      className="text-slate-300 focus:bg-slate-800 focus:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: a.color }}
                        />
                        {a.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seta — visível apenas no desktop */}
            <div className="hidden sm:flex items-end justify-center h-11">
              <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Destino</Label>
              <Select
                value={form.to_account_id}
                onValueChange={(v) => { if (v) set('to_account_id', v) }}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-11">
                  <AccountTriggerContent account={toAccount} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {accounts.map((a) => (
                    <SelectItem
                      key={a.id}
                      value={a.id}
                      className="text-slate-300 focus:bg-slate-800 focus:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: a.color }}
                        />
                        {a.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sameAccountError && (
            <p className="text-red-400 text-xs -mt-2">Selecione contas diferentes.</p>
          )}

          {/* Preview de saldos */}
          {fromAccount && toAccount && !sameAccountError && (
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-4 py-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: fromAccount.color }}
                />
                <span className="truncate">{fromAccount.name}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: toAccount.color }}
                />
                <span className="truncate">{toAccount.name}</span>
              </div>
            </div>
          )}

          {/* Valor */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                R$
              </span>
              <Input
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder="0,00"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11 pl-9"
              />
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Data</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
              className="bg-slate-800 border-slate-700 text-white h-11"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Transferência"
              maxLength={100}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || sameAccountError || !form.from_account_id || !form.to_account_id}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Transferir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
