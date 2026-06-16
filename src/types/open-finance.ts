// ─── Open Finance — tipos de provider e DB ───────────────────────────────────

export type OFProviderSlug = 'pluggy' | 'belvo' | 'klavi'

export interface OFProvider {
  id: OFProviderSlug
  name: string
  logoUrl: string
  active: boolean
}

// Conexão armazenada em of_connections (DB)
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

// Dado bruto retornado pelo provider (nível de adapter)
export interface OFAccount {
  external_id: string
  connection_id: string
  name: string
  type: string
  balance: number
  currency: string
  institution_name: string
}

// Linha armazenada em of_accounts (DB)
export interface OFAccountRecord {
  id: string
  user_id: string
  connection_id: string
  account_id: string | null
  external_id: string
  name: string
  type: string
  institution: string
  currency: string
  last_balance: number | null
  last_sync: string | null
  created_at: string
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
