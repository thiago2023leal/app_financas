import type { IAIProvider, AIMessage } from './ai.interface'
import { ClaudeAdapter } from './claude.adapter'
import { OpenAIAdapter } from './openai.adapter'
import type { Transaction, DashboardSummary } from '@/types'

const PROVIDERS: Record<string, IAIProvider> = {
  claude: new ClaudeAdapter(),
  openai: new OpenAIAdapter(),
}

function buildFinancialContext(
  summary: DashboardSummary,
  transactions: Transaction[]
): string {
  const topExpenses = transactions
    .filter((t) => t.type === 'despesa')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((t) => `- ${t.description}: R$ ${t.amount.toFixed(2)} (${t.category})`)
    .join('\n')

  return `
Você é um assistente financeiro pessoal inteligente e empático.
Responda sempre em português do Brasil, de forma clara e objetiva.
Use os dados financeiros do usuário para personalizar suas respostas.

DADOS DO MÊS ATUAL:
- Receitas: R$ ${summary.totalIncome.toFixed(2)}
- Despesas: R$ ${summary.totalExpenses.toFixed(2)}
- Saldo: R$ ${summary.balance.toFixed(2)}

MAIORES GASTOS:
${topExpenses || '(sem gastos registrados)'}

Seja proativo em sugerir melhorias e identificar padrões de consumo.
`.trim()
}

// Respostas locais quando nenhum provider de IA está configurado
function localAnalysis(userMessage: string, summary: DashboardSummary, transactions: Transaction[]): string {
  const q = userMessage.toLowerCase()

  if (q.includes('gasto') || q.includes('despesa') || q.includes('caro')) {
    const byCat: Record<string, number> = {}
    transactions.filter((t) => t.type === 'despesa').forEach((t) => {
      byCat[t.category] = (byCat[t.category] ?? 0) + t.amount
    })
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]
    if (top) return `Sua maior categoria de gasto é **${top[0]}** com R$ ${top[1].toFixed(2)}. Tente reduzir gastos nessa categoria para melhorar seu saldo.`
    return 'Você não tem despesas registradas neste período.'
  }

  if (q.includes('economi') || q.includes('poupar') || q.includes('guardo')) {
    const rate = summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0
    return `Sua taxa de economia atual é **${rate.toFixed(1)}%**. ${rate >= 20 ? 'Ótimo! Você está economizando bem.' : rate >= 10 ? 'Razoável. Tente chegar a 20% de economia.' : 'Abaixo do ideal. Tente reduzir suas despesas.'}`
  }

  if (q.includes('saldo') || q.includes('quanto')) {
    return `Seu saldo atual é **R$ ${summary.balance.toFixed(2)}**. Receitas: R$ ${summary.totalIncome.toFixed(2)} · Despesas: R$ ${summary.totalExpenses.toFixed(2)}.`
  }

  if (q.includes('projeção') || q.includes('próximo') || q.includes('futuro')) {
    const savings = summary.totalIncome - summary.totalExpenses
    return `Com base no mês atual, você tem uma economia de **R$ ${savings.toFixed(2)}**. Em 12 meses, mantendo esse ritmo, acumularia **R$ ${(savings * 12).toFixed(2)}**.`
  }

  return `Posso ajudar com análises de gastos, taxa de economia, projeções e dicas financeiras. O que você gostaria de saber sobre suas finanças?`
}

export const aiService = {
  async chat(
    messages: AIMessage[],
    summary: DashboardSummary,
    transactions: Transaction[],
    provider = 'claude'
  ): Promise<string> {
    const systemPrompt = buildFinancialContext(summary, transactions)

    try {
      const p = PROVIDERS[provider]
      if (!p) throw new Error(`Provider "${provider}" não encontrado.`)
      return (await p.chat(messages, systemPrompt)).text
    } catch (err) {
      // Fallback: análise local sem IA
      const lastMessage = messages[messages.length - 1]?.content ?? ''
      return localAnalysis(lastMessage, summary, transactions)
    }
  },

  getAvailableProviders(): string[] {
    return Object.keys(PROVIDERS)
  },
}
