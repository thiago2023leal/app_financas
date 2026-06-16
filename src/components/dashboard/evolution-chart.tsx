'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface EvolutionPoint {
  month: number
  year: number
  income: number
  expenses: number
  balance: number
}

const MONTH_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface EvolutionChartProps {
  data: EvolutionPoint[]
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  const chartData = data.map((d) => ({
    name: `${MONTH_ABBR[d.month - 1]}/${String(d.year).slice(2)}`,
    Receitas: d.income,
    Despesas: d.expenses,
    Saldo: d.balance,
  }))

  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center h-72">
        <p className="text-slate-500 text-sm">Dados insuficientes para gráfico</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-white font-semibold text-sm mb-5">Evolução dos últimos 6 meses</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={48} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }}
            formatter={(value) => [formatCurrency(Number(value ?? 0))]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Line type="monotone" dataKey="Receitas" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
