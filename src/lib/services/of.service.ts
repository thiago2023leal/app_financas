import { createClient } from '@/lib/supabase/client'
import type { OFConnection, OFAccountRecord } from '@/types/open-finance'

const supabase = createClient()

function throwPg(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Erro ao processar operação Open Finance.')
}

export const ofService = {
  async listConnections(): Promise<OFConnection[]> {
    const { data, error } = await supabase
      .from('of_connections')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throwPg(error)
    return data ?? []
  },

  async listOFAccounts(): Promise<OFAccountRecord[]> {
    const { data, error } = await supabase
      .from('of_accounts')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throwPg(error)
    return data ?? []
  },

  async linkOFAccount(ofAccountId: string, accountId: string): Promise<void> {
    const { error } = await supabase
      .from('of_accounts')
      .update({ account_id: accountId })
      .eq('id', ofAccountId)
    if (error) throwPg(error)
  },

  async unlinkOFAccount(ofAccountId: string): Promise<void> {
    const { error } = await supabase
      .from('of_accounts')
      .update({ account_id: null })
      .eq('id', ofAccountId)
    if (error) throwPg(error)
  },

  async deleteConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('of_connections')
      .delete()
      .eq('id', connectionId)
    if (error) throwPg(error)
  },
}
