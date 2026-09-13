'use client'

import { useEffect, useState } from 'react'

type Row = {
  label: string
  category: string
  amount: number
}

const ROWS: Row[] = [
  { label: 'Salário', category: 'Receita', amount: 4200 },
  { label: 'Mercado', category: 'Alimentação', amount: -387.4 },
  { label: 'Assinatura streaming', category: 'Assinaturas', amount: -39.9 },
  { label: 'Transporte', category: 'Transporte', amount: -212.5 },
]

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function HeroLedger() {
  const [reduceMotion] = useState(prefersReducedMotion)
  const [visible, setVisible] = useState(() => (prefersReducedMotion() ? ROWS.length : 0))

  useEffect(() => {
    if (reduceMotion || visible >= ROWS.length) return
    const t = setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 300 : 450)
    return () => clearTimeout(t)
  }, [visible, reduceMotion])

  const runningTotal = ROWS.slice(0, visible).reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Extrato</span>
        <span className="text-xs text-slate-500">Julho 2026</span>
      </div>

      <div className="divide-y divide-slate-800/70">
        {ROWS.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-3 transition-all duration-500 ${
              i < visible ? 'opacity-100 translate-y-0' : reduceMotion ? '' : 'opacity-0 translate-y-1'
            }`}
          >
            <div>
              <p className="text-sm text-white font-medium">{row.label}</p>
              <p className="text-xs text-slate-500">{row.category}</p>
            </div>
            <span
              className={`font-mono text-sm tabular-nums ${row.amount >= 0 ? 'text-blue-400' : 'text-orange-300'}`}
            >
              {row.amount >= 0 ? '+' : ''}
              {formatBRL(row.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 py-4 bg-slate-900/80">
        <span className="text-sm text-slate-300">Saldo do mês</span>
        <span className="font-mono text-lg font-semibold tabular-nums text-white">
          {formatBRL(runningTotal)}
        </span>
      </div>
    </div>
  )
}
