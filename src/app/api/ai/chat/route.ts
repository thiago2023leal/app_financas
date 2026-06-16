import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeAdapter } from '@/lib/ai/claude.adapter'
import type { AIMessage } from '@/lib/ai/ai.interface'
import type { Transaction, Account, Budget, Goal, OFAccountRecord } from '@/types'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function buildSystemPrompt(data: {
  transactions: Transaction[]
  accounts: Account[]
  budgets: Budget[]
  goals: Goal[]
  ofAccounts: OFAccountRecord[]
}): string {
  const { transactions, accounts, budgets, goals, ofAccounts } = data

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthLabel = `${String(month).padStart(2, '0')}/${year}`

  // Resumo do mês
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })
  const totalIncome = monthTx.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = monthTx.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0'

  // Gastos por categoria no mês
  const byCat: Record<string, number> = {}
  monthTx.filter((t) => t.type === 'despesa').forEach((t) => {
    byCat[t.category] = (byCat[t.category] ?? 0) + t.amount
  })
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Seções do prompt
  const resumo = [
    `RESUMO DO MÊS (${monthLabel}):`,
    `- Receitas:        ${fmt(totalIncome)}`,
    `- Despesas:        ${fmt(totalExpenses)}`,
    `- Saldo do mês:    ${fmt(balance)}`,
    `- Taxa de economia: ${savingsRate}%`,
  ].join('\n')

  const contasStr = accounts.length > 0
    ? accounts.map((a) => {
        const of = ofAccounts.find((o) => o.account_id === a.id)
        if (of && of.last_balance !== null) {
          const syncDate = of.last_sync ? new Date(of.last_sync).toLocaleDateString('pt-BR') : 'nunca'
          return `- ${a.name} (${a.type}): saldo calculado ${fmt(a.current_balance)} | saldo bancário ${fmt(of.last_balance)} via ${of.institution} (atualizado ${syncDate})`
        }
        return `- ${a.name} (${a.type}): ${fmt(a.current_balance)}`
      }).join('\n')
    : '(sem contas cadastradas)'

  const gastosStr = topCats.length > 0
    ? topCats.map(([cat, v]) => `- ${cat}: ${fmt(v)}`).join('\n')
    : '(sem despesas neste mês)'

  const recentStr = transactions.slice(0, 15).map((t) =>
    `- ${t.date}: ${t.description} ${t.type === 'receita' ? '+' : '-'}${fmt(t.amount)} [${t.category}]`
  ).join('\n') || '(sem transações recentes)'

  const activeBudgets = budgets.filter((b) => b.month === month && b.year === year)
  const orcamentoStr = activeBudgets.length > 0
    ? activeBudgets.map((b) => {
        const spent = byCat[b.category] ?? 0
        const pct = b.amount > 0 ? ((spent / b.amount) * 100).toFixed(0) : '0'
        const status = spent > b.amount ? '⚠ EXCEDIDO' : spent / b.amount > 0.8 ? '⚠ próximo do limite' : '✓'
        return `- ${b.category}: limite ${fmt(b.amount)}, gasto ${fmt(spent)} (${pct}%) ${status}`
      }).join('\n')
    : '(sem orçamentos configurados para este mês)'

  const activeGoals = goals.filter((g) => g.status === 'active')
  const metasStr = activeGoals.length > 0
    ? activeGoals.map((g) => {
        const pct = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(0) : '0'
        const prazo = g.target_date ? `, prazo ${new Date(g.target_date).toLocaleDateString('pt-BR')}` : ''
        return `- ${g.name}: meta ${fmt(g.target_amount)}, acumulado ${fmt(g.current_amount)} (${pct}%)${prazo}`
      }).join('\n')
    : '(sem metas ativas)'

  return `Você é L-Finanças AI, assistente financeiro pessoal inteligente e empático.

REGRAS OBRIGATÓRIAS:
- Responda SEMPRE em português do Brasil
- Use formato monetário brasileiro: R$ X.XXX,XX
- Cite APENAS dados reais fornecidos abaixo — nunca invente valores ou estimativas sem base
- Quando não houver dados suficientes para responder, informe claramente
- Seja objetivo e direto; prefira respostas curtas e práticas
- Identifique padrões e sugira melhorias quando pertinente
- Não repita os dados brutos; interprete-os e dê uma resposta útil

=== DADOS FINANCEIROS REAIS DO USUÁRIO ===

${resumo}

CONTAS (${accounts.length} ativa${accounts.length !== 1 ? 's' : ''}):
${contasStr}

MAIORES GASTOS POR CATEGORIA (${monthLabel}):
${gastosStr}

ÚLTIMAS 15 TRANSAÇÕES:
${recentStr}

ORÇAMENTOS (${monthLabel}):
${orcamentoStr}

METAS ATIVAS:
${metasStr}`.trim()
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  let messages: AIMessage[]
  try {
    const body = await request.json() as { messages?: unknown }
    if (!Array.isArray(body.messages) || body.messages.length === 0) throw new Error()
    messages = body.messages as AIMessage[]
  } catch {
    return NextResponse.json({ error: 'Body inválido. Envie { messages: AIMessage[] }.' }, { status: 400 })
  }

  // Buscar todos os dados financeiros em paralelo
  const now = new Date()
  const [txResult, accountsResult, budgetsResult, goalsResult, ofResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(50),
    supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('name'),
    supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear()),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at'),
    supabase
      .from('of_accounts')
      .select('*')
      .eq('user_id', user.id),
  ])

  const transactions = (txResult.data ?? []) as Transaction[]
  const accounts = (accountsResult.data ?? []) as Account[]
  const budgets = (budgetsResult.data ?? []) as Budget[]
  const goals = (goalsResult.data ?? []) as Goal[]
  const ofAccounts = (ofResult.data ?? []) as OFAccountRecord[]

  const systemPrompt = buildSystemPrompt({ transactions, accounts, budgets, goals, ofAccounts })

  try {
    const adapter = new ClaudeAdapter()
    const reply = await adapter.chat(messages, systemPrompt)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[AI Chat] Erro ao chamar Claude:', err)
    const message = err instanceof Error ? err.message : 'Erro interno ao processar sua mensagem.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
