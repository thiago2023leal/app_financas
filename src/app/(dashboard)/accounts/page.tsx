'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useOFAccounts, useOFConnections, useLinkOFAccount, useUnlinkOFAccount, useDeleteOFConnection, OF_ACCOUNTS_KEY, OF_CONNECTIONS_KEY } from '@/lib/hooks/use-of-accounts'
import { useTransfers } from '@/lib/hooks/use-transfers'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { TransferForm } from '@/components/transfers/transfer-form'
import { PluggyConnectButton } from '@/components/open-finance/pluggy-connect-button'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { Plus, CreditCard, AlertTriangle, RefreshCw, Loader2, Link2, Link2Off, ArrowLeftRight, Unplug } from 'lucide-react'
import type { Account, AccountFormData, TransferFormData } from '@/types'
import { toast } from 'sonner'
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
  SelectValue,
} from '@/components/ui/select'

export default function AccountsPage() {
  const queryClient = useQueryClient()
  const { accounts, loading, create, update, remove, totalBalance } = useAccounts()
  const { data: ofAccounts = [] } = useOFAccounts()
  const { data: connections = [] } = useOFConnections()
  const linkMutation = useLinkOFAccount()
  const unlinkMutation = useUnlinkOFAccount()
  const deleteConnectionMutation = useDeleteOFConnection()

  const { create: createTransfer } = useTransfers()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [disconnectingConnectionId, setDisconnectingConnectionId] = useState<string | null>(null)
  const [disconnectLoading, setDisconnectLoading] = useState(false)

  async function handleTransfer(formData: TransferFormData) {
    await createTransfer(formData)
    toast.success('Transferência realizada.')
  }

  async function handleDisconnect() {
    if (!disconnectingConnectionId) return
    setDisconnectLoading(true)
    try {
      await deleteConnectionMutation.mutateAsync(disconnectingConnectionId)
      toast.success('Conexão Open Finance removida com sucesso.\nAs contas permanecem disponíveis para gerenciamento manual.')
      setDisconnectingConnectionId(null)
    } catch {
      toast.error('Erro ao remover conexão Open Finance.')
    } finally {
      setDisconnectLoading(false)
    }
  }

  // Contas OF sem vínculo com conta interna
  const unlinkedOFAccounts = ofAccounts.filter((ofa) => ofa.account_id === null)

  function openCreate() { setEditingAccount(null); setFormOpen(true) }
  function openEdit(account: Account) { setEditingAccount(account); setFormOpen(true) }

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

  async function handleSync(externalId: string) {
    setSyncingId(externalId)
    try {
      const res = await fetch('/api/of/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: externalId }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Erro na sincronização.' }))
        throw new Error(error)
      }
      const { synced } = await res.json() as { synced: number }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: OF_ACCOUNTS_KEY }),
        queryClient.invalidateQueries({ queryKey: OF_CONNECTIONS_KEY }),
      ])
      toast.success(`${synced} conta${synced !== 1 ? 's' : ''} atualizada${synced !== 1 ? 's' : ''}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro na sincronização.')
    } finally {
      setSyncingId(null)
    }
  }

  async function handleLink(ofAccountId: string, accountId: string) {
    try {
      await linkMutation.mutateAsync({ ofAccountId, accountId })
      toast.success('Conta vinculada.')
    } catch {
      toast.error('Erro ao vincular conta.')
    }
  }

  async function handleUnlink(ofAccountId: string) {
    try {
      await unlinkMutation.mutateAsync(ofAccountId)
      toast.success('Vínculo removido.')
    } catch {
      toast.error('Erro ao remover vínculo.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Contas</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie suas contas financeiras</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PluggyConnectButton />
          {/* grid-cols-2 no mobile → igual largura; sm:contents dissolve o wrapper no flex pai */}
          <div className="grid grid-cols-2 gap-2 sm:contents">
            <Button
              variant="outline"
              onClick={() => setTransferOpen(true)}
              disabled={accounts.length < 2}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
            >
              <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
              Nova transferência
            </Button>
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <Plus className="w-4 h-4 flex-shrink-0" />
              Nova conta
            </Button>
          </div>
        </div>
      </div>

      {/* Patrimônio total */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900/50 rounded-xl p-6">
        <p className="text-slate-400 text-sm mb-1">Patrimônio total</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(totalBalance)}</p>
        <p className="text-slate-500 text-xs mt-1">{accounts.length} conta{accounts.length !== 1 ? 's' : ''} ativa{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Conexões Open Finance ativas */}
      {connections.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">Open Finance</p>
          {connections.map((conn) => (
            <div key={conn.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${conn.status === 'active' ? 'bg-emerald-400' : conn.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                <span className="text-slate-300 text-sm truncate">{conn.provider_id}</span>
                {conn.status === 'error' && (
                  <span className="text-red-400 text-xs hidden sm:inline">· erro na última sincronização</span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={syncingId === conn.external_id}
                  onClick={() => handleSync(conn.external_id)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5 h-7 px-2 text-xs"
                >
                  {syncingId === conn.external_id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <RefreshCw className="w-3 h-3" />}
                  Sincronizar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDisconnectingConnectionId(conn.id)}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 gap-1.5 h-7 px-2 text-xs"
                >
                  <Unplug className="w-3 h-3" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
          {accounts.map((account) => {
            const ofAccount = ofAccounts.find((ofa) => ofa.account_id === account.id)
            return (
              <div key={account.id} className="relative group">
                <AccountCard
                  account={account}
                  ofAccount={ofAccount}
                  onEdit={openEdit}
                  onDelete={setDeletingAccount}
                />
                {ofAccount && (
                  <button
                    onClick={() => handleUnlink(ofAccount.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all"
                    title="Remover vínculo Open Finance"
                  >
                    <Link2Off className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Contas bancárias não vinculadas */}
      {unlinkedOFAccounts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            <p className="text-white text-sm font-semibold">Contas bancárias não vinculadas</p>
            <span className="text-xs text-slate-500">({unlinkedOFAccounts.length})</span>
          </div>
          <p className="text-slate-500 text-xs">Vincule cada conta bancária a uma conta do L-Finanças para exibir o saldo bancário.</p>
          <div className="space-y-2">
            {unlinkedOFAccounts.map((ofa) => (
              <div key={ofa.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ofa.name}</p>
                  <p className="text-slate-500 text-xs">{ofa.institution} · {ofa.last_balance !== null ? formatCurrency(ofa.last_balance) : '—'}</p>
                </div>
                <Select
                  onValueChange={(value) => { if (typeof value === 'string') handleLink(ofa.id, value) }}
                  disabled={linkMutation.isPending}
                >
                  <SelectTrigger className="w-44 h-8 text-xs bg-slate-800 border-slate-700 text-slate-300">
                    <SelectValue placeholder="Vincular a…" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} className="text-slate-300 text-xs focus:bg-slate-800">
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form modal */}
      <AccountForm
        open={formOpen}
        account={editingAccount}
        isManual={!editingAccount || !ofAccounts.find((ofa) => ofa.account_id === editingAccount.id)}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Transfer modal */}
      <TransferForm
        open={transferOpen}
        accounts={accounts}
        onClose={() => setTransferOpen(false)}
        onSubmit={handleTransfer}
      />

      {/* Disconnect OF connection confirm */}
      <Dialog
        open={!!disconnectingConnectionId}
        onOpenChange={(v) => !v && setDisconnectingConnectionId(null)}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <Unplug className="w-5 h-5" />
              Remover conexão Open Finance?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-slate-300 text-sm">
            <p>A sincronização com o banco será interrompida.</p>
            <p>As contas continuarão existindo normalmente e poderão ser gerenciadas manualmente.</p>
            <p className="text-slate-500 text-xs">Esta ação não remove transações, transferências ou saldos já registrados.</p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setDisconnectingConnectionId(null)}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={disconnectLoading}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white gap-2"
            >
              {disconnectLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Remover conexão
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
