/**
 * Pluggy adapter — Fase 0: fetchAccounts implementado via REST (sem SDK).
 * Usar REST direto evita riscos de compatibilidade com Turbopack/Next.js 16.
 * Documentação: https://docs.pluggy.ai
 */
import type { IOpenFinanceProvider } from './of.interface'
import type { OFAccount, OFConnection, OFTransaction } from '@/types/open-finance'

// Formato bruto retornado por GET /accounts da API Pluggy
interface PluggyAccountRaw {
  id: string
  name: string
  marketingName?: string
  type: string
  subtype?: string
  balance: number
  currencyCode: string
  itemId: string
}

// Mapeamento de tipos Pluggy → AccountType do sistema
const PLUGGY_TYPE_MAP: Record<string, string> = {
  CHECKING_ACCOUNT: 'corrente',
  SAVINGS_ACCOUNT: 'poupanca',
  CREDIT_CARD: 'digital',
  INVESTMENT: 'investimentos',
  BANK: 'corrente',
  CREDIT: 'digital',
}

function mapPluggyType(subtype?: string, type?: string): string {
  if (subtype && PLUGGY_TYPE_MAP[subtype]) return PLUGGY_TYPE_MAP[subtype]
  if (type && PLUGGY_TYPE_MAP[type]) return PLUGGY_TYPE_MAP[type]
  return 'corrente'
}

export class PluggyAdapter implements IOpenFinanceProvider {
  readonly slug = 'pluggy'
  readonly name = 'Pluggy'

  private async getApiKey(): Promise<string> {
    const res = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Pluggy auth falhou (${res.status}): ${body}`)
    }
    const { apiKey } = await res.json()
    return apiKey as string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(_credentials: Record<string, string>): Promise<string> {
    // O connect token é gerado na API route /api/of/connect-token.
    // Este método não é usado no fluxo do Pluggy Connect Widget.
    throw new Error('Pluggy: use /api/of/connect-token para gerar o connectToken do Widget.')
  }

  async fetchAccounts(connection: OFConnection): Promise<OFAccount[]> {
    const apiKey = await this.getApiKey()
    const res = await fetch(
      `https://api.pluggy.ai/accounts?itemId=${connection.external_id}`,
      { headers: { 'X-API-KEY': apiKey } }
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Pluggy fetchAccounts falhou (${res.status}): ${body}`)
    }
    const { results } = (await res.json()) as { results: PluggyAccountRaw[] }
    const institutionName =
      (connection.metadata?.institution_name as string | undefined) ?? 'Banco'

    return (results ?? []).map((a) => ({
      external_id: a.id,
      connection_id: connection.id,
      name: a.marketingName ?? a.name ?? 'Conta',
      type: mapPluggyType(a.subtype, a.type),
      balance: a.balance ?? 0,
      currency: a.currencyCode ?? 'BRL',
      institution_name: institutionName,
    }))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchTransactions(_connection: OFConnection, _accountId: string, _since: Date): Promise<OFTransaction[]> {
    throw new Error('Pluggy: fetchTransactions não implementado na Fase 0.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disconnect(_connection: OFConnection): Promise<void> {
    throw new Error('Pluggy: disconnect não implementado na Fase 0.')
  }
}
