'use client'

import { useState } from 'react'
import { useBudgets } from '@/lib/hooks/use-budgets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { getCategoryColor } from '@/lib/utils/colors'
import { EXPENSE_CATEGORIES, type Category, type BudgetFormData } from '@/types'
import { Plus, PieChart, AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const now = new Date()

export default function BudgetsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const { budgets, loading, upsert, remove, totalBudgeted, totalSpent, overBudget } = useBudgets(month, year)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState<BudgetFormData>({
    category: 'Alimentação',
    amount: '',
    month,
    year,
  })
  const [saving, setSaving] = useState(false)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await upsert({ ...formData, month, year })
      toast.success('Orçamento salvo.')
      setFormOpen(false)
    } catch {
      toast.error('Erro ao salvar orçamento.')
    } finally {
      setSaving(false)
    }
  }

  const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orçamento</h1>
          <p className="text-slate-400 text-sm mt-1">Controle seus gastos por categoria</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Novo orçamento
        </Button>
      </div>

      {/* Seletor de mês */}
      <div className="flex items-center gap-4">
        <button onClick={prevMonth} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">‹</button>
        <span className="text-white font-semibold min-w-36 text-center">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">›</button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total orçado</p>
          <p className="text-white font-bold text-xl">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total gasto</p>
          <p className="text-red-400 font-bold text-xl">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Disponível</p>
          <p className={cn('font-bold text-xl', totalBudgeted - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatCurrency(totalBudgeted - totalSpent)}
          </p>
        </div>
      </div>

      {/* Alertas */}
      {overBudget.length > 0 && (
        <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm">Orçamento estourado</p>
            <p className="text-red-400/80 text-xs mt-0.5">
              {overBudget.map((b) => b.category).join(', ')} ultrapassaram o limite.
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-slate-800" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <PieChart className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Nenhum orçamento definido</p>
          <p className="text-slate-600 text-sm mb-6">Defina limites por categoria para controlar seus gastos.</p>
          <Button onClick={() => setFormOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            Criar orçamento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(b.category) }} />
                  <span className="text-white font-medium text-sm">{b.category}</span>
                  {b.percentage >= 90 && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      b.percentage >= 100 ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                    )}>
                      {b.percentage >= 100 ? 'Estourado' : `${Math.round(b.percentage)}%`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </span>
                  <button
                    onClick={async () => { await remove(b.id); toast.success('Orçamento removido.') }}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                    aria-label="Remover orçamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', b.percentage >= 100 ? 'bg-red-500' : b.percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-slate-600 text-xs">{Math.round(b.percentage)}% utilizado</span>
                <span className={cn('text-xs', b.remaining >= 0 ? 'text-slate-500' : 'text-red-400')}>
                  {b.remaining >= 0 ? `Disponível: ${formatCurrency(b.remaining)}` : `Excedido: ${formatCurrency(Math.abs(b.remaining))}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo orçamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Categoria</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value as Category }))}
                className="w-full h-10 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm"
              >
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Limite (R$)</Label>
              <Input
                value={formData.amount}
                onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0,00"
                required
                inputMode="decimal"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
