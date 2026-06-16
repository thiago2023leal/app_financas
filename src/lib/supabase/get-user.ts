import { createClient } from './client'

export async function getAuthUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Sessão expirada. Faça login novamente.')
  return user
}
