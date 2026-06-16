import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PluggyAdapter } from '@/lib/open-finance/pluggy.adapter'

const adapter = new PluggyAdapter()

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  let body: { itemId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 })
  }
  const { itemId } = body
  if (!itemId) {
    return NextResponse.json({ error: 'itemId é obrigatório.' }, { status: 400 })
  }

  // Upsert da conexão (cria se não existir, atualiza status para active se existir)
  const { data: connection, error: connErr } = await supabase
    .from('of_connections')
    .upsert(
      { user_id: user.id, provider_id: 'pluggy', external_id: itemId, status: 'active' },
      { onConflict: 'user_id,provider_id,external_id' }
    )
    .select()
    .single()
  if (connErr || !connection) {
    return NextResponse.json({ error: connErr?.message ?? 'Erro ao salvar conexão.' }, { status: 500 })
  }

  try {
    // Buscar contas no Pluggy
    const ofAccounts = await adapter.fetchAccounts(connection)

    // Upsert de cada conta — NÃO toca accounts.current_balance
    let synced = 0
    const now = new Date().toISOString()
    for (const acc of ofAccounts) {
      const { error } = await supabase
        .from('of_accounts')
        .upsert(
          {
            user_id: user.id,
            connection_id: connection.id,
            external_id: acc.external_id,
            name: acc.name,
            type: acc.type,
            institution: acc.institution_name,
            currency: acc.currency,
            last_balance: acc.balance,
            last_sync: now,
          },
          { onConflict: 'connection_id,external_id' }
        )
      if (!error) synced++
    }

    // Atualizar last_sync da conexão
    await supabase
      .from('of_connections')
      .update({ last_sync: now, status: 'active' })
      .eq('id', connection.id)

    return NextResponse.json({ connectionId: connection.id, synced })
  } catch (err) {
    // Marcar conexão como erro para que a UI possa sinalizar ao usuário
    await supabase
      .from('of_connections')
      .update({ status: 'error' })
      .eq('id', connection.id)

    const message = err instanceof Error ? err.message : 'Erro na sincronização.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
