/**
 * Open Finance service — orquestra os adapters disponíveis.
 * Adicione novos adapters aqui conforme as integrações forem implementadas.
 */
import type { IOpenFinanceProvider } from './of.interface'
import { PluggyAdapter } from './pluggy.adapter'
import { BelvoAdapter } from './belvo.adapter'
import type { OFProviderSlug } from '@/types/open-finance'

const PROVIDERS: Record<OFProviderSlug, IOpenFinanceProvider> = {
  pluggy: new PluggyAdapter(),
  belvo: new BelvoAdapter(),
  klavi: {
    slug: 'klavi',
    name: 'Klavi',
    connect: async () => { throw new Error('Klavi: integração não implementada.') },
    fetchAccounts: async () => { throw new Error('Klavi: integração não implementada.') },
    fetchTransactions: async () => { throw new Error('Klavi: integração não implementada.') },
    disconnect: async () => { throw new Error('Klavi: integração não implementada.') },
  },
}

export const openFinanceService = {
  getProvider(slug: OFProviderSlug): IOpenFinanceProvider {
    return PROVIDERS[slug]
  },

  listProviders(): IOpenFinanceProvider[] {
    return Object.values(PROVIDERS)
  },
}
