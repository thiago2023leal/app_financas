'use client'

import { useState } from 'react'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { Plus, CreditCard, AlertTriangle } from 'lucide-react'
import type { Account, AccountFormData } from '@/types'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AccountsPage() {
  const { accounts, loading, create, update, remove, totalBalance } = useAccounts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function openCreate() {
    setEditingAccount(null)
    setFormOpen(true)
  }

  function openEdit(account: Account) {
    setEditingAccount(account)
    setFormOpen(true)
  }

  async function handleSubmit(formData: AccountFormData) {
    try {
      if (editingAccount) {
        await update(editingAccount.id, formData)
        toast.success('Conta atualizada.')
      } else {
        await create(formData)
        toast.success('Conta criada.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err) || 'Erro desconhecido'
      toast.error(`Erro: ${msg}`)
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return
    setDeleteLoading(true)
    try {
      await remove(deletingAccount.id)
      toast.success('Conta removida.')
      setDeletingAccount(null)
    } catch {
      toast.error('Erro ao remover conta.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contas</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie suas contas financeiras</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nova conta
        </Button>
      </div>

      {/* Patrimônio total */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900/50 rounded-xl p-6">
        <p className="text-slate-400 text-sm mb-1">Patrimônio total</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(totalBalance)}</p>
        <p className="text-slate-500 text-xs mt-1">{accounts.length} conta{accounts.length !== 1 ? 's' : ''} ativa{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Lista de contas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Nenhuma conta cadastrada</p>
          <p className="text-slate-600 text-sm mb-6">Crie sua primeira conta para começar a organizar suas finanças.</p>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            Criar primeira conta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openEdit}
              onDelete={setDeletingAccount}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <AccountForm
        open={formOpen}
        account={editingAccount}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Delete confirm */}
      <Dialog open={!!deletingAccount} onOpenChange={(v) => !v && setDeletingAccount(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Remover conta
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-300 text-sm">
            Deseja remover a conta <span className="font-semibold text-white">"{deletingAccount?.name}"</span>?
            As transações vinculadas não serão excluídas.
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingAccount(null)}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white"
            >
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
