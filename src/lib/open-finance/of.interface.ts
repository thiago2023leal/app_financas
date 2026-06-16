import type { OFAccount, OFConnection, OFTransaction } from '@/types/open-finance'

export interface IOpenFinanceProvider {
  readonly slug: string
  readonly name: string

  /**
   * Autentica e cria uma conexão com o banco do usuário.
   * Retorna o external_id gerado pelo provider.
   */
  connect(credentials: Record<string, string>): Promise<string>

  /** Sincroniza contas de uma conexão */
  fetchAccounts(connection: OFConnection): Promise<OFAccount[]>

  /** Sincroniza transações de uma conta */
  fetchTransactions(connection: OFConnection, accountId: string, since: Date): Promise<OFTransaction[]>

  /** Desconecta / revoga acesso */
  disconnect(connection: OFConnection): Promise<void>
}
