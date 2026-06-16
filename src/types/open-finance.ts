// ─── Open Finance — Estrutura preparatória ──────────────────────────────────
// Compatível com: Pluggy, Belvo, Klavi
// Implementação futura: não implementado, apenas interfaces e estrutura

export type OFProviderSlug = 'pluggy' | 'belvo' | 'klavi'

export interface OFProvider {
  id: OFProviderSlug
  name: string
  logoUrl: string
  active: boolean
}

export interface OFConnection {
  id: string
  user_id: string
  provider_id: OFProviderSlug
  external_id: string
  status: 'active' | 'error' | 'pending'
  last_sync?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface OFAccount {
  external_id: string
  connection_id: string
  name: string
  type: string
  balance: number
  currency: string
  institution_name: string
}

export interface OFTransaction {
  external_id: string
  account_id: string
  description: string
  amount: number
  date: string
  category?: string
  type: 'credit' | 'debit'
}
