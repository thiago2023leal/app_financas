'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteDialogProps {
  transaction: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteDialog({ transaction, onClose, onSuccess }: DeleteDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!transaction) return
    setLoading(true)
    const { error } = await supabase.from('transactions').delete().eq('id', transaction.id)
    if (error) {
      toast.error('Erro ao excluir transação.')
    } else {
      toast.success('Transação excluída.')
      onSuccess()
      onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={!!transaction} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-950 border border-red-900 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <DialogTitle className="text-white">Excluir transação</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-slate-400 text-sm mt-2">
          Tem certeza que deseja excluir{' '}
          <span className="text-white font-medium">"{transaction?.description}"</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
