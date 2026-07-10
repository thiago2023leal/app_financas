'use client'

import { useState } from 'react'
import { useRecurring } from '@/lib/hooks/use-recurring'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/utils/date'
import { RecurringFormData, INCOME_CATEGORIES, EXPENSE_CATEGORIES, RECURRING_FREQUENCY_LABELS, type RecurringFrequency } from '@/types'
import { Plus, RefreshCw, Pencil, Trash2, Loader2, Play, Pause, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { todayISO } from '@/lib/utils/date'

const DEFAULT_FORM: RecurringFormData = {
  description: '', amount: '', type: 'despesa', category: 'Alimentação',
  frequency: 'mensal', start_date: todayISO(), end_date: '', account_id: '',
}

export default function RecurringPage() {
  const { recurring, loading, create, update, toggle, remove, confirmPayment, activeCount, pendingCount } = useRecurring()
  const { accounts } = useAccounts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRec, setEditingRec] = useState<typeof recurring[0] | null>(null)
  const [form, setForm] = useState<RecurringFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  async function handleConfirmPayment(id: string) {
    setConfirmingId(id)
    try {
      await confirmPayment(id)
      toast.success('Pagamento confirmado. Transação lançada.')
    } catch {
      toast.error('Erro ao confirmar pagamento.')
    } finally {
      setConfirmingId(null)
    }
  }

  function openCreate() { setEditingRec(null); setForm({ ...DEFAULT_FORM, start_date: todayISO() }); setFormOpen(true) }
  function openEdit(r: typeof recurring[0]) {
    setEditingRec(r)
    setForm({
      description: r.description, amount: r.amount.toFixed(2).replace('.', ','),
      type: r.type, category: r.category, frequency: r.frequency,
      start_date: r.start_date, end_date: r.end_date ?? '', account_id: r.account_id ?? '',
    })
    setFormOpen(true)
  }

  function updateType(type: 'receita' | 'despesa') {
    const cats = type === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    setForm((f) => ({ ...f, type, category: cats[0] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingRec) { await update(editingRec.id, form); toast.success('Recorrência atualizada.') }
      else { await create(form); toast.success('Recorrência criada.') }
      setFormOpen(false)
    } catch { toast.error('Erro ao salvar recorrência.') }
    finally { setSaving(false) }
  }

  const categories = form.type === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recorrentes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {activeCount} recorrência{activeCount !== 1 ? 's' : ''} ativa{activeCount !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span className="text-amber-400"> · {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nova recorrência
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-xl bg-slate-800" />)}
        </div>
      ) : recurring.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <RefreshCw className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Nenhuma recorrência cadastrada</p>
          <p className="text-slate-600 text-sm mb-6">Cadastre assinaturas, contas fixas e salários recorrentes.</p>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            Criar recorrência
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((r) => {
            const today = todayISO()
            const isOverdue = r.active && r.next_due_date < today
            const isDueToday = r.active && r.next_due_date === today
            const isPending = isOverdue || isDueToday
            return (
            <div key={r.id} className={cn('bg-slate-900 border rounded-xl p-4 transition-colors', isPending ? 'border-amber-700/60' : r.active ? 'border-slate-800' : 'border-slate-800/50 opacity-60')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', r.type === 'receita' ? 'bg-emerald-400' : 'bg-red-400')} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm">{r.description}</p>
                      {isPending && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          {isOverdue ? 'Vencida' : 'Pendente'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 text-xs">{r.category}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500 text-xs">{RECURRING_FREQUENCY_LABELS[r.frequency]}</span>
                      <span className="text-slate-700">·</span>
                      <span className={cn('text-xs', isPending ? 'text-amber-400' : 'text-slate-500')}>
                        {isPending ? 'venceu em' : 'Próxima em'} {formatDate(r.next_due_date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('font-semibold text-sm', r.type === 'receita' ? 'text-emerald-400' : 'text-red-400')}>
                    {r.type === 'despesa' ? '-' : '+'}{formatCurrency(r.amount)}
                  </span>
                  <div className="flex gap-1">
                    {r.active && (
                      <button
                        onClick={() => handleConfirmPayment(r.id)}
                        disabled={confirmingId === r.id}
                        className="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Confirmar pagamento"
                        title="Confirmar pagamento"
                      >
                        {confirmingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button onClick={() => toggle(r.id, !r.active)} className={cn('p-1.5 rounded-lg transition-colors', r.active ? 'text-slate-500 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-600 hover:text-emerald-400 hover:bg-slate-800')} aria-label={r.active ? 'Pausar' : 'Ativar'}>
                      {r.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={async () => { await remove(r.id); toast.success('Recorrência removida.') }} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader><DialogTitle>{editingRec ? 'Editar recorrência' : 'Nova recorrência'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-lg">
              {(['despesa', 'receita'] as const).map((t) => (
                <button key={t} type="button" onClick={() => updateType(t)} className={cn('py-2 rounded-md text-sm font-medium transition-colors', form.type === t ? (t === 'receita' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'text-slate-400 hover:text-white')}>
                  {t === 'receita' ? 'Receita' : 'Despesa'}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Ex: Netflix, Aluguel..." required maxLength={80} className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Valor (R$)</Label>
                <Input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0,00" required inputMode="decimal" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Frequência</Label>
                <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as RecurringFrequency }))} className="w-full h-10 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm">
                  {Object.entries(RECURRING_FREQUENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Início</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} required className="bg-slate-800 border-slate-700 text-white h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Fim <span className="text-slate-600">(opcional)</span></Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} className="bg-slate-800 border-slate-700 text-white h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Categoria</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} className={cn('px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors', form.category === cat ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white')}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {accounts.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Conta <span className="text-slate-600">(opcional)</span></Label>
                <select value={form.account_id ?? ''} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="w-full h-10 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm">
                  <option value="">Sem conta específica</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editingRec ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
