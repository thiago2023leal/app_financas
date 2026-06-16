'use client'

import { useState } from 'react'
import { useGoals } from '@/lib/hooks/use-goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/utils/date'
import { Goal, GoalFormData } from '@/types'
import { Plus, Target, CheckCircle, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const PRESET_COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#ef4444']
const DEFAULT_FORM: GoalFormData = { name: '', description: '', target_amount: '', current_amount: '0', target_date: '', color: '#22c55e', icon: 'target' }

export default function GoalsPage() {
  const { goals, loading, create, update, remove, complete } = useGoals()
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [form, setForm] = useState<GoalFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null)
  const [progressValue, setProgressValue] = useState('')

  function openCreate() { setEditingGoal(null); setForm(DEFAULT_FORM); setFormOpen(true) }
  function openEdit(g: Goal) {
    setEditingGoal(g)
    setForm({
      name: g.name, description: g.description ?? '', target_amount: g.target_amount.toFixed(2).replace('.', ','),
      current_amount: g.current_amount.toFixed(2).replace('.', ','), target_date: g.target_date ?? '',
      color: g.color, icon: g.icon,
    })
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingGoal) {
        await update(editingGoal.id, form)
        toast.success('Meta atualizada.')
      } else {
        await create(form)
        toast.success('Meta criada.')
      }
      setFormOpen(false)
    } catch { toast.error('Erro ao salvar meta.') }
    finally { setSaving(false) }
  }

  async function handleProgress(e: React.FormEvent) {
    e.preventDefault()
    if (!progressGoal) return
    const val = parseFloat(progressValue.replace(',', '.'))
    if (isNaN(val) || val < 0) return
    try {
      await update(progressGoal.id, { current_amount: progressValue })
      toast.success('Progresso atualizado.')
      setProgressGoal(null)
    } catch { toast.error('Erro ao atualizar progresso.') }
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Metas</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe seus objetivos financeiros</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nova meta
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-48 rounded-xl bg-slate-800" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Target className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Nenhuma meta criada</p>
          <p className="text-slate-600 text-sm mb-6">Defina objetivos e acompanhe seu progresso.</p>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            Criar primeira meta
          </Button>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-slate-400 text-sm font-medium mb-3">Ativas ({activeGoals.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((g) => {
                  const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0
                  return (
                    <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: g.color + '20' }}>
                            <Target className="w-4 h-4" style={{ color: g.color }} />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{g.name}</p>
                            {g.target_date && <p className="text-slate-500 text-xs">até {formatDate(g.target_date)}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(g)} className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={async () => { await remove(g.id); toast.success('Meta removida.') }} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{formatCurrency(g.current_amount)}</span>
                          <span>{formatCurrency(g.target_amount)}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-xs">{Math.round(pct)}% concluído</span>
                          <div className="flex gap-2">
                            <button onClick={() => { setProgressGoal(g); setProgressValue(g.current_amount.toFixed(2).replace('.', ',')) }} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Atualizar</button>
                            {pct >= 100 && (
                              <button onClick={async () => { await complete(g.id); toast.success('Meta concluída!') }} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">Concluir</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-slate-400 text-sm font-medium mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />Concluídas ({completedGoals.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((g) => (
                  <div key={g.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 opacity-70">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-slate-300 font-medium text-sm">{g.name}</p>
                    </div>
                    <p className="text-emerald-400 font-bold">{formatCurrency(g.target_amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Form modal */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader><DialogTitle>{editingGoal ? 'Editar meta' : 'Nova meta'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Nome da meta</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Comprar carro, Viagem..." required maxLength={60} className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Valor alvo (R$)</Label>
                <Input value={form.target_amount} onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))} placeholder="0,00" required inputMode="decimal" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Valor atual (R$)</Label>
                <Input value={form.current_amount} onChange={(e) => setForm((f) => ({ ...f, current_amount: e.target.value }))} placeholder="0,00" inputMode="decimal" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Data alvo <span className="text-slate-600">(opcional)</span></Label>
              <Input type="date" value={form.target_date} onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))} className="bg-slate-800 border-slate-700 text-white h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))} className={cn('w-8 h-8 rounded-full border-2 transition-all', form.color === c ? 'border-white scale-110' : 'border-transparent')} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editingGoal ? 'Salvar' : 'Criar meta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Progress update modal */}
      <Dialog open={!!progressGoal} onOpenChange={(v) => !v && setProgressGoal(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader><DialogTitle>Atualizar progresso</DialogTitle></DialogHeader>
          <form onSubmit={handleProgress} className="space-y-4 mt-2">
            <p className="text-slate-400 text-sm">Meta: <span className="text-white font-medium">{progressGoal?.name}</span></p>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Valor atual (R$)</Label>
              <Input value={progressValue} onChange={(e) => setProgressValue(e.target.value)} placeholder="0,00" required inputMode="decimal" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setProgressGoal(null)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
