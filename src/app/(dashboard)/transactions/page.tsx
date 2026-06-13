'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction, TransactionFilters } from '@/types'
import { exportToCSV } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { TransactionFiltersBar } from '@/components/transactions/transaction-filters'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { DeleteDialog } from '@/components/transactions/delete-dialog'

export default function TransactionsPage() {
  const supabase = createClient()
  const now = new Date()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    category: 'all',
    search: '',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0).toISOString().split('T')[0]

    let query = supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    if (filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    const { data } = await query
    setTransactions((data as Transaction[]) ?? [])
    setLoading(false)
  }, [filters.month, filters.year, filters.category, supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filtered = filters.search
    ? transactions.filter((t) =>
        t.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    : transactions

  function handleEdit(t: Transaction) {
    setEditingTransaction(t)
    setFormOpen(true)
  }

  function handleNewTransaction() {
    setEditingTransaction(null)
    setFormOpen(true)
  }

  function handleExportCSV() {
    const filename = `transacoes_${String(filters.month).padStart(2, '0')}_${filters.year}`
    exportToCSV(filtered, filename)
  }

  const totalIncome = filtered.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filtered.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Transações</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length} transação{filtered.length !== 1 ? 'ões' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            onClick={handleNewTransaction}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova transação
          </Button>
        </div>
      </div>

      <TransactionFiltersBar filters={filters} onChange={setFilters} />

      {/* Summary row */}
      {!loading && filtered.length > 0 && (
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-400 font-medium">
            + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-red-400 font-medium">
            - R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <TransactionTable
        transactions={filtered}
        loading={loading}
        onEdit={handleEdit}
        onDelete={setDeletingTransaction}
      />

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTransaction(null) }}
        onSuccess={fetchTransactions}
        transaction={editingTransaction}
      />

      <DeleteDialog
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onSuccess={fetchTransactions}
      />
    </div>
  )
}
