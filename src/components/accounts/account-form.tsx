'use client'

import { useState } from 'react'
import { Account, AccountFormData, AccountType, ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#ef4444',
]

interface AccountFormProps {
  open: boolean
  account?: Account | null
  onClose: () => void
  onSubmit: (data: AccountFormData) => Promise<void>
}

const DEFAULT_FORM: AccountFormData = {
  name: '',
  type: 'corrente',
  initial_balance: '0',
  color: '#3b82f6',
  icon: 'wallet',
}

export function AccountForm({ open, account, onClose, onSubmit }: AccountFormProps) {
  const [form, setForm] = useState<AccountFormData>(() =>
    account
      ? {
          name: account.name,
          type: account.type,
          initial_balance: account.initial_balance.toFixed(2).replace('.', ','),
          color: account.color,
          icon: account.icon,
        }
      : DEFAULT_FORM
  )
  const [loading, setLoading] = useState(false)

  function set<K extends keyof AccountFormData>(key: K, value: AccountFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err) || 'Erro desconhecido'
      toast.error(`Erro: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? 'Editar conta' : 'Nova conta'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Nome da conta</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Nubank, Carteira, Poupança..."
              required
              maxLength={50}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('type', type as AccountType)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left',
                    form.type === type
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                  )}
                >
                  {ACCOUNT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {!account && (
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Saldo inicial</Label>
              <Input
                value={form.initial_balance}
                onChange={(e) => set('initial_balance', e.target.value)}
                placeholder="0,00"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('color', color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    form.color === color ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
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
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {account ? 'Salvar' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
