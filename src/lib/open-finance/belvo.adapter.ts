/**
 * Belvo adapter — estrutura preparatória.
 * Documentação: https://developers.belvo.com
 */
import type { IOpenFinanceProvider } from './of.interface'
import type { OFAccount, OFConnection, OFTransaction } from '@/types/open-finance'

export class BelvoAdapter implements IOpenFinanceProvider {
  readonly slug = 'belvo'
  readonly name = 'Belvo'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(_credentials: Record<string, string>): Promise<string> {
    throw new Error('Belvo: integração não implementada.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchAccounts(_connection: OFConnection): Promise<OFAccount[]> {
    throw new Error('Belvo: integração não implementada.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchTransactions(_connection: OFConnection, _accountId: string, _since: Date): Promise<OFTransaction[]> {
    throw new Error('Belvo: integração não implementada.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disconnect(_connection: OFConnection): Promise<void> {
    throw new Error('Belvo: integração não implementada.')
  }
}
