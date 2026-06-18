'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DraftCard } from '@/components/ai/draft-card'
import { useDraftConfirmation } from '@/lib/hooks/use-draft-confirmation'
import { useAccounts } from '@/lib/hooks/use-accounts'
import type { AIDraft, ChatEntry, TransactionDraftPayload, TransferDraftPayload } from '@/types'

const SUGGESTIONS = [
  'Onde gasto mais este mês?',
  'Qual minha taxa de economia?',
  'Como posso reduzir despesas?',
  'Qual minha projeção anual?',
  'Qual categoria mais cara?',
]

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function AIPage() {
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { confirmDraft } = useDraftConfirmation()
  const { accounts } = useAccounts()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userEntry: ChatEntry = { id: newId(), message: { role: 'user', content } }
    const newEntries = [...entries, userEntry]
    setEntries(newEntries)
    setInput('')
    setLoading(true)

    try {
      // Nunca enviar ChatEntry para a API — apenas o formato de transporte { role, content }.
      const wireMessages = newEntries.map((e) => e.message)
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: wireMessages }),
      })
      const data = await res.json() as { reply?: string; draft?: AIDraft; error?: string }
      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Erro ao processar resposta.')
      }
      setEntries((prev) => [
        ...prev,
        {
          id: newId(),
          message: { role: 'assistant', content: data.reply! },
          draft: data.draft,
          draftStatus: data.draft ? 'pending' : undefined,
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro na conexão com o assistente.'
      setEntries((prev) => [...prev, { id: newId(), message: { role: 'assistant', content: `⚠️ ${msg}` } }])
    } finally {
      setLoading(false)
    }
  }

  function handleCancelDraft(entryId: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId && e.draftStatus === 'pending' ? { ...e, draftStatus: 'cancelled' } : e))
    )
  }

  function handleRetryDraft(entryId: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId && e.draftStatus === 'error' ? { ...e, draftStatus: 'pending', draftError: undefined } : e))
    )
  }

  function handleStartEdit(entryId: string) {
    const entry = entries.find((e) => e.id === entryId)
    // Defesa: só permite editar draft pendente — espelha a guarda usada em handleConfirmDraft.
    if (!entry || entry.draftStatus !== 'pending') return
    setEditingEntryId(entryId)
  }

  function handleCancelEdit() {
    // Descarta o formulário sem tocar em entries — o draft original permanece intacto.
    setEditingEntryId(null)
  }

  function handleSaveEdit(entryId: string, newPayload: TransactionDraftPayload | TransferDraftPayload) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId || !e.draft) return e
        return e.draft.kind === 'transaction'
          ? { ...e, draft: { ...e.draft, payload: newPayload as TransactionDraftPayload } }
          : { ...e, draft: { ...e.draft, payload: newPayload as TransferDraftPayload } }
      })
    )
    setEditingEntryId(null)
  }

  async function handleConfirmDraft(entryId: string) {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry?.draft) return
    // Guarda: bloqueia duplo clique, confirmação de draft cancelado e re-execução de draft já confirmado.
    if (entry.draftStatus !== 'pending') return

    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, draftStatus: 'executing' } : e)))

    try {
      await confirmDraft(entry.draft)
      setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, draftStatus: 'confirmed' } : e)))
      toast.success(
        entry.draft.kind === 'transfer'
          ? 'Transferência registrada com sucesso.'
          : entry.draft.payload.type === 'receita'
            ? 'Receita registrada com sucesso.'
            : 'Despesa registrada com sucesso.'
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar lançamento.'
      setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, draftStatus: 'error', draftError: msg } : e)))
      // useTransfers().create() já exibe seu próprio toast de erro antes de relançar —
      // evitar toast duplicado para transferências; transações usam o service direto e não toastam.
      if (entry.draft.kind === 'transaction') {
        toast.error(`Erro ao registrar: ${msg}`)
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Assistente Financeiro IA</h1>
            <p className="text-slate-400 text-sm">Análise inteligente das suas finanças</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Como posso ajudar?</p>
              <p className="text-slate-400 text-sm max-w-md">
                Faça perguntas sobre seus gastos, metas, economia ou peça análises personalizadas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-xs hover:border-blue-600 hover:text-blue-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {entries.map((entry) => (
              <div key={entry.id} className="space-y-2">
                <div className={cn('flex gap-3', entry.message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    entry.message.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
                  )}>
                    {entry.message.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-blue-400" />
                    }
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    entry.message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  )}>
                    {entry.message.content.split('\n').map((line, i, arr) => (
                      <span key={i}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          /^\*\*.*?\*\*$/.test(part)
                            ? <strong key={j}>{part.slice(2, -2)}</strong>
                            : part
                        )}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card de confirmação — não herda max-w-[80%] da bolha de mensagem */}
                {entry.draft && (
                  <DraftCard
                    draft={entry.draft}
                    status={entry.draftStatus ?? 'pending'}
                    errorMessage={entry.draftError}
                    accounts={accounts}
                    isEditing={editingEntryId === entry.id}
                    onCancel={() => handleCancelDraft(entry.id)}
                    onConfirm={() => handleConfirmDraft(entry.id)}
                    onRetry={() => handleRetryDraft(entry.id)}
                    onStartEdit={() => handleStartEdit(entry.id)}
                    onSaveEdit={(payload) => handleSaveEdit(entry.id, payload)}
                    onCancelEdit={handleCancelEdit}
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-4 border-t border-slate-800">
        {entries.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-400 text-xs hover:border-blue-600 hover:text-blue-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre suas finanças..."
            disabled={loading}
            className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white h-11 w-11 p-0"
            aria-label="Enviar"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
