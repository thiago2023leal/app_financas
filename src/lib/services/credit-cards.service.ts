import { createClient } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/get-user'
import type { CreditCard, CreditCardFormData } from '@/types'
import { parseCurrencyInput } from '@/lib/utils/currency'
import { addDays, addMonths, subMonths, setDate, startOfDay, format } from 'date-fns'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação.')
}

export interface CreditCardInvoice {
  total: number
  periodStart: string
  periodEnd: string
  dueDate: string
}

// Ciclo aberto (ainda não fechado) de um cartão, calculado a partir de
// closing_day/due_day — nunca lido nem escrito em banco, sempre recomputado
// a partir de "hoje". Por isso um pagamento antecipado nunca altera o ciclo
// financeiro do cartão (Decisão 4, homologada na Fase 1): closing_day e
// due_day são fixos, e esta função só lê esses dois valores + a data atual.
export function computeCurrentCycle(closingDay: number, dueDay: number, referenceDate: Date = new Date()) {
  const today = startOfDay(referenceDate)
  const thisMonthClose = startOfDay(setDate(today, closingDay))

  const periodEnd = today <= thisMonthClose ? thisMonthClose : setDate(addMonths(today, 1), closingDay)
  const previousClose = setDate(subMonths(periodEnd, 1), closingDay)
  const periodStart = addDays(previousClose, 1)

  const dueDate = dueDay < closingDay
    ? setDate(addMonths(periodEnd, 1), dueDay)
    : setDate(periodEnd, dueDay)

  return { periodStart, periodEnd, dueDate }
}

// Fase 5 (Opção B, corrige bug de pagamento duplicado): "fatura atual"
// deriva de current_balance — a mesma fonte de verdade já mantida pelo
// trigger de saldo (migração 004), nunca uma soma independente de
// `transactions`. A versão anterior somava só despesas do ciclo sem
// descontar pagamentos (transfers), então a fatura continuava mostrando
// o valor cheio mesmo depois de paga, permitindo pagar a mesma fatura
// duas vezes. Usando current_balance, o valor já vem corretamente
// zerado assim que o trigger processa o pagamento — sem cache próprio
// para invalidar.
//
// computeCurrentCycle só calcula as datas de fechamento/vencimento —
// nunca participa do valor da fatura.
//
// Preparado para a Fase 10: quando a fatura virar uma entidade persistida
// (credit_card_invoices, com status pago/pendente e histórico), esta
// função deve virar uma consulta a essa tabela em vez de um cálculo
// local — a assinatura (accountId + closingDay/dueDay) e o formato de
// retorno (CreditCardInvoice) já são compatíveis com isso, então a troca
// fica isolada aqui dentro, sem exigir mudança em quem chama.
export function getCurrentInvoice(
  accountId: string,
  currentBalance: number,
  closingDay: number,
  dueDay: number
): CreditCardInvoice {
  const { periodStart, periodEnd, dueDate } = computeCurrentCycle(closingDay, dueDay)
  return {
    total: Math.max(0, -currentBalance),
    periodStart: format(periodStart, 'yyyy-MM-dd'),
    periodEnd: format(periodEnd, 'yyyy-MM-dd'),
    dueDate: format(dueDate, 'yyyy-MM-dd'),
  }
}

// Fase 3: só metadados (bandeira, limite, fechamento, vencimento).
// Nenhum cálculo de limite utilizado/disponível aqui — fica reservado
// para a Fase 6, quando toda a lógica financeira do cartão estiver pronta.
export const creditCardsService = {
  async listAll(): Promise<CreditCard[]> {
    const { data, error } = await supabase.from('credit_cards').select('*')
    if (error) throwPg(error)
    return data ?? []
  },

  async create(accountId: string, formData: CreditCardFormData): Promise<CreditCard> {
    const user = await getAuthUser()
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        user_id: user.id,
        account_id: accountId,
        brand: formData.brand,
        limit_amount: parseCurrencyInput(formData.limit_amount),
        closing_day: Number(formData.closing_day),
        due_day: Number(formData.due_day),
      })
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },

  async update(id: string, formData: Partial<CreditCardFormData>): Promise<CreditCard> {
    const updates: Record<string, unknown> = {}
    if (formData.brand !== undefined) updates.brand = formData.brand
    if (formData.limit_amount !== undefined) updates.limit_amount = parseCurrencyInput(formData.limit_amount)
    if (formData.closing_day !== undefined) updates.closing_day = Number(formData.closing_day)
    if (formData.due_day !== undefined) updates.due_day = Number(formData.due_day)

    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throwPg(error)
    return data
  },
}
