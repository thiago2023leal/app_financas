import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeAdapter } from '@/lib/ai/claude.adapter'
import type { AIMessage, AIToolDefinition } from '@/lib/ai/ai.interface'
import type { Transaction, Account, Budget, Goal, OFAccountRecord, AIDraft, Category } from '@/types'
import { CATEGORIES } from '@/types'

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
  const todayLabel = now.toLocaleDateString('pt-BR')

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

Hoje é: ${todayLabel}
Use esta data para interpretar termos relativos como "hoje", "ontem", "semana passada" e "mês passado".

USO DE FERRAMENTAS (register_transaction / register_transfer):
- Use uma ferramenta SOMENTE quando o usuário relatar uma movimentação financeira real já ocorrida ou a ocorrer
  (ex: "gastei 50 no mercado", "recebi meu salário", "transferi 200 da carteira para o Nubank").
- NÃO use ferramenta para perguntas analíticas (ex: "quanto gastei esse mês?", "qual minha taxa de economia?") —
  responda essas em texto, usando os dados já fornecidos abaixo.
- NUNCA invente uma conta que não esteja na lista de CONTAS abaixo.
- Sempre preencha o campo confidence (0.0 a 1.0) refletindo sua certeza sobre TODOS os campos extraídos.
  Use confidence baixo (< 0.90) quando houver qualquer ambiguidade — por exemplo, um nome que pode ser uma
  conta ou outra coisa (ex: "paguei 150 na 99" pode ser a conta "99" ou uma corrida de aplicativo).
- A ferramenta apenas estrutura uma proposta para confirmação posterior pelo usuário — nenhuma gravação ocorre
  automaticamente.

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

// ─── Tools — extração estruturada (Fase 1: sem gravação) ────────────────────

function buildTools(): AIToolDefinition[] {
  return [
    {
      name: 'register_transaction',
      description:
        'Estrutura uma proposta de receita ou despesa extraída da mensagem do usuário. ' +
        'Não executa nenhuma gravação — apenas organiza os dados para confirmação posterior pelo usuário.',
      input_schema: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'Descrição curta do lançamento.' },
          amount: { type: 'number', description: 'Valor em reais, sempre positivo.' },
          type: { type: 'string', enum: ['receita', 'despesa'] },
          category: { type: 'string', enum: CATEGORIES },
          date: { type: 'string', description: 'Data no formato YYYY-MM-DD.' },
          account_name: {
            type: 'string',
            description: 'Nome da conta mencionada pelo usuário, o mais próximo possível do nome real.',
          },
          confidence: {
            type: 'number',
            description:
              'Confiança de 0.0 a 1.0 de que a extração está correta e sem ambiguidade. ' +
              'Use valor baixo (< 0.90) sempre que houver dúvida sobre valor, conta, categoria ou data.',
          },
        },
        required: ['description', 'amount', 'type', 'category', 'date', 'account_name', 'confidence'],
      },
    },
    {
      name: 'register_transfer',
      description:
        'Estrutura uma proposta de transferência entre contas extraída da mensagem do usuário. ' +
        'Não executa nenhuma gravação — apenas organiza os dados para confirmação posterior pelo usuário.',
      input_schema: {
        type: 'object',
        properties: {
          from_account_name: { type: 'string', description: 'Nome da conta de origem mencionada pelo usuário.' },
          to_account_name: { type: 'string', description: 'Nome da conta de destino mencionada pelo usuário.' },
          amount: { type: 'number', description: 'Valor em reais, sempre positivo.' },
          date: { type: 'string', description: 'Data no formato YYYY-MM-DD.' },
          description: { type: 'string', description: 'Descrição opcional da transferência.' },
          confidence: {
            type: 'number',
            description:
              'Confiança de 0.0 a 1.0 de que a extração está correta e sem ambiguidade. ' +
              'Use valor baixo (< 0.90) sempre que houver dúvida sobre as contas, valor ou data.',
          },
        },
        required: ['from_account_name', 'to_account_name', 'amount', 'date', 'confidence'],
      },
    },
  ]
}

const CONFIDENCE_THRESHOLD = 0.9

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime())
}

function isValidCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value)
}

// Resolve um nome de conta livre (digitado/falado pelo usuário) para uma conta real.
// Retorna null se não houver exatamente uma correspondência confiável.
function resolveAccount(accounts: Account[], rawName: unknown): { account: Account | null; ambiguous: boolean } {
  if (typeof rawName !== 'string') return { account: null, ambiguous: false }
  const needle = rawName.trim().toLowerCase()
  if (!needle) return { account: null, ambiguous: false }

  const exact = accounts.filter((a) => a.name.trim().toLowerCase() === needle)
  if (exact.length === 1) return { account: exact[0], ambiguous: false }
  if (exact.length > 1) return { account: null, ambiguous: true }

  const partial = accounts.filter(
    (a) => a.name.toLowerCase().includes(needle) || needle.includes(a.name.toLowerCase())
  )
  if (partial.length === 1) return { account: partial[0], ambiguous: false }
  if (partial.length > 1) return { account: null, ambiguous: true }

  return { account: null, ambiguous: false }
}

interface DraftResult {
  draft?: AIDraft
  clarification?: string
}

function buildTransactionDraft(input: Record<string, unknown>, accounts: Account[]): DraftResult {
  const confidence = typeof input.confidence === 'number' ? input.confidence : 0
  if (confidence < CONFIDENCE_THRESHOLD) {
    return {
      clarification:
        'Não tenho certeza suficiente sobre esse lançamento. Pode confirmar o valor, a conta, a categoria e a data?',
    }
  }

  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const amount = typeof input.amount === 'number' ? input.amount : NaN
  const type = input.type === 'receita' || input.type === 'despesa' ? input.type : null
  const category = input.category
  const date = input.date

  if (!(amount > 0)) {
    return { clarification: 'O valor informado precisa ser maior que zero. Pode confirmar o valor da movimentação?' }
  }
  if (!type) {
    return { clarification: 'Não consegui identificar se é uma receita ou despesa. Pode esclarecer?' }
  }
  if (!isValidCategory(category)) {
    return {
      clarification: `Não reconheci a categoria informada. Pode confirmar uma categoria válida (ex: ${CATEGORIES.slice(0, 3).join(', ')})?`,
    }
  }
  if (!isValidDate(date)) {
    return { clarification: 'Não consegui identificar a data da movimentação. Pode informar quando ocorreu?' }
  }

  const { account, ambiguous } = resolveAccount(accounts, input.account_name)
  if (!account) {
    const accountName = typeof input.account_name === 'string' ? input.account_name : ''
    return {
      clarification: ambiguous
        ? `Encontrei mais de uma conta parecida com "${accountName}". Qual conta você quis dizer?`
        : `Não encontrei nenhuma conta chamada "${accountName}". Pode confirmar o nome da conta?`,
    }
  }

  return {
    draft: {
      kind: 'transaction',
      confidence,
      payload: {
        description: description || category,
        amount,
        type,
        category,
        date,
        account_id: account.id,
        account_name: account.name,
      },
    },
  }
}

function buildTransferDraft(input: Record<string, unknown>, accounts: Account[]): DraftResult {
  const confidence = typeof input.confidence === 'number' ? input.confidence : 0
  if (confidence < CONFIDENCE_THRESHOLD) {
    return {
      clarification:
        'Não tenho certeza suficiente sobre essa transferência. Pode confirmar a conta de origem, destino, valor e data?',
    }
  }

  const amount = typeof input.amount === 'number' ? input.amount : NaN
  const date = input.date
  const description = typeof input.description === 'string' && input.description.trim() ? input.description.trim() : 'Transferência'

  if (!(amount > 0)) {
    return { clarification: 'O valor da transferência precisa ser maior que zero. Pode confirmar?' }
  }
  if (!isValidDate(date)) {
    return { clarification: 'Não consegui identificar a data da transferência. Pode informar quando ocorreu?' }
  }

  const fromResolved = resolveAccount(accounts, input.from_account_name)
  const toResolved = resolveAccount(accounts, input.to_account_name)

  if (!fromResolved.account) {
    const fromName = typeof input.from_account_name === 'string' ? input.from_account_name : ''
    return {
      clarification: fromResolved.ambiguous
        ? `Encontrei mais de uma conta parecida com "${fromName}" como origem. Qual você quis dizer?`
        : `Não encontrei a conta de origem "${fromName}". Pode confirmar?`,
    }
  }
  if (!toResolved.account) {
    const toName = typeof input.to_account_name === 'string' ? input.to_account_name : ''
    return {
      clarification: toResolved.ambiguous
        ? `Encontrei mais de uma conta parecida com "${toName}" como destino. Qual você quis dizer?`
        : `Não encontrei a conta de destino "${toName}". Pode confirmar?`,
    }
  }
  if (fromResolved.account.id === toResolved.account.id) {
    return { clarification: 'A conta de origem e destino não podem ser iguais. Pode confirmar as contas da transferência?' }
  }

  return {
    draft: {
      kind: 'transfer',
      confidence,
      payload: {
        from_account_id: fromResolved.account.id,
        from_account_name: fromResolved.account.name,
        to_account_id: toResolved.account.id,
        to_account_name: toResolved.account.name,
        amount,
        date,
        description,
      },
    },
  }
}

function buildDraftSummaryText(draft: AIDraft): string {
  if (draft.kind === 'transaction') {
    const { amount, type, category, description, account_name, date } = draft.payload
    const verb = type === 'receita' ? 'uma receita' : 'uma despesa'
    return `Identifiquei ${verb} de ${fmt(amount)} em ${category} (${description}), na conta ${account_name}, em ${date}. Confirma o lançamento?`
  }
  const { amount, from_account_name, to_account_name, date } = draft.payload
  return `Identifiquei uma transferência de ${fmt(amount)} de ${from_account_name} para ${to_account_name}, em ${date}. Confirma?`
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
  const tools = buildTools()

  try {
    const adapter = new ClaudeAdapter()
    const result = await adapter.chat(messages, systemPrompt, tools)

    if (!result.toolCall) {
      return NextResponse.json({ reply: result.text })
    }

    // Extração estruturada apenas — NENHUMA gravação ocorre nesta fase.
    let draftResult: DraftResult
    if (result.toolCall.name === 'register_transaction') {
      draftResult = buildTransactionDraft(result.toolCall.input, accounts)
    } else if (result.toolCall.name === 'register_transfer') {
      draftResult = buildTransferDraft(result.toolCall.input, accounts)
    } else {
      draftResult = { clarification: 'Não entendi sua solicitação. Pode reformular?' }
    }

    if (draftResult.draft) {
      const reply = result.text || buildDraftSummaryText(draftResult.draft)
      return NextResponse.json({ reply, draft: draftResult.draft })
    }

    return NextResponse.json({ reply: draftResult.clarification ?? result.text })
  } catch (err) {
    console.error('[AI Chat] Erro ao chamar Claude:', err)
    const message = err instanceof Error ? err.message : 'Erro interno ao processar sua mensagem.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
