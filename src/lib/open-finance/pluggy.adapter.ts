/**
 * Pluggy adapter — estrutura preparatória.
 * Documentação: https://docs.pluggy.ai
 *
 * Implementar quando a integração for contratada.
 * Nenhum código de produção deve ser adicionado aqui sem credenciais reais.
 */
import type { IOpenFinanceProvider } from './of.interface'
import type { OFAccount, OFConnection, OFTransaction } from '@/types/open-finance'

export class PluggyAdapter implements IOpenFinanceProvider {
  readonly slug = 'pluggy'
  readonly name = 'Pluggy'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(_credentials: Record<string, string>): Promise<string> {
    throw new Error('Pluggy: integração não implementada. Adicione CLIENT_ID e CLIENT_SECRET.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchAccounts(_connection: OFConnection): Promise<OFAccount[]> {
    throw new Error('Pluggy: integração não implementada.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchTransactions(_connection: OFConnection, _accountId: string, _since: Date): Promise<OFTransaction[]> {
    throw new Error('Pluggy: integração não implementada.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disconnect(_connection: OFConnection): Promise<void> {
    throw new Error('Pluggy: integração não implementada.')
  }
}
