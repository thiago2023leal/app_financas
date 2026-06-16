'use client'

import { useState, useRef, useEffect } from 'react'
import { aiService } from '@/lib/ai/ai.service'
import { useDashboardSummary } from '@/lib/hooks/use-transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIMessage } from '@/lib/ai/ai.interface'

const SUGGESTIONS = [
  'Onde gasto mais este mês?',
  'Qual minha taxa de economia?',
  'Como posso reduzir despesas?',
  'Qual minha projeção anual?',
  'Qual categoria mais cara?',
]

const now = new Date()

export default function AIPage() {
  const { summary, recentTransactions } = useDashboardSummary(now.getMonth() + 1, now.getFullYear())
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: AIMessage = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const reply = await aiService.chat(newMessages, summary, recentTransactions)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }])
    } finally {
      setLoading(false)
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
        {messages.length === 0 ? (
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
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
                )}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-blue-400" />
                  }
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                )}>
                  {msg.content.split('\n').map((line, i, arr) => (
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
        {messages.length > 0 && (
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
