'use client'

import { useState, useEffect } from 'react'
import {
  Account, AccountFormData, AccountType, ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS,
  CreditCard, CreditCardFormData, CREDIT_CARD_BRANDS, CREDIT_CARD_BRAND_LABELS,
} from '@/types'
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

const DAY_OPTIONS = Array.from({ length: 28 }, (_, i) => i + 1)

interface AccountFormProps {
  open: boolean
  account?: Account | null
  creditCard?: CreditCard | null
  isManual?: boolean
  onClose: () => void
  onSubmit: (data: AccountFormData, creditCardData?: CreditCardFormData) => Promise<void>
}

const DEFAULT_FORM: AccountFormData = {
  name: '',
  type: 'corrente',
  initial_balance: '0',
  color: '#3b82f6',
  icon: 'wallet',
}

const DEFAULT_CC_FORM: CreditCardFormData = {
  brand: 'visa',
  limit_amount: '',
  closing_day: '5',
  due_day: '12',
}

export function AccountForm({ open, account, creditCard, isManual, onClose, onSubmit }: AccountFormProps) {
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
  const [ccForm, setCcForm] = useState<CreditCardFormData>(() =>
    creditCard
      ? {
          brand: creditCard.brand,
          limit_amount: creditCard.limit_amount.toFixed(2).replace('.', ','),
          closing_day: String(creditCard.closing_day),
          due_day: String(creditCard.due_day),
        }
      : DEFAULT_CC_FORM
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
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
    setCcForm(
      creditCard
        ? {
            brand: creditCard.brand,
            limit_amount: creditCard.limit_amount.toFixed(2).replace('.', ','),
            closing_day: String(creditCard.closing_day),
            due_day: String(creditCard.due_day),
          }
        : DEFAULT_CC_FORM
    )
  }, [open, account, creditCard])

  function set<K extends keyof AccountFormData>(key: K, value: AccountFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Cartão de crédito não tem "saldo inicial" — o campo fica travado em 0.
  // A dívida só nasce das compras lançadas nele (ver Fase 1: a prova
  // matemática do módulo assume saldo inicial = 0 para qualquer cartão).
  function selectType(type: AccountType) {
    setForm((prev) => ({ ...prev, type, initial_balance: type === 'cartao' ? '0' : prev.initial_balance }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      await onSubmit(form, form.type === 'cartao' ? ccForm : undefined)
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
                  onClick={() => selectType(type as AccountType)}
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

          {form.type === 'cartao' && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Bandeira</Label>
                <select
                  value={ccForm.brand}
                  onChange={(e) => setCcForm((f) => ({ ...f, brand: e.target.value as CreditCardFormData['brand'] }))}
                  className="w-full h-11 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm"
                >
                  {CREDIT_CARD_BRANDS.map((b) => <option key={b} value={b}>{CREDIT_CARD_BRAND_LABELS[b]}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Limite total (R$)</Label>
                <Input
                  value={ccForm.limit_amount}
                  onChange={(e) => setCcForm((f) => ({ ...f, limit_amount: e.target.value }))}
                  placeholder="0,00"
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Dia de fechamento</Label>
                  <select
                    value={ccForm.closing_day}
                    onChange={(e) => setCcForm((f) => ({ ...f, closing_day: e.target.value }))}
                    className="w-full h-11 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm"
                  >
                    {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Dia de vencimento</Label>
                  <select
                    value={ccForm.due_day}
                    onChange={(e) => setCcForm((f) => ({ ...f, due_day: e.target.value }))}
                    className="w-full h-11 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm"
                  >
                    {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {(!account || isManual) && form.type !== 'cartao' && (
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">
                Saldo inicial
                {account && <span className="text-slate-500 text-xs ml-2">(o saldo atual será recalculado)</span>}
              </Label>
              <Input
                value={form.initial_balance}
                onChange={(e) => set('initial_balance', e.target.value)}
                placeholder="0,00"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
              />
            </div>
          )}

          {form.type === 'cartao' && (
            <p className="text-slate-500 text-xs -mt-1">
              Cartões de crédito começam com saldo zero — a dívida nasce das compras lançadas nele.
            </p>
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
