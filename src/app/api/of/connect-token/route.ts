import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    // 1. Obter apiKey do Pluggy
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    })
    if (!authRes.ok) {
      const msg = await authRes.text()
      throw new Error(`Pluggy auth falhou: ${msg}`)
    }
    const { apiKey } = await authRes.json() as { apiKey: string }

    // 2. Gerar connectToken para o Widget
    const tokenRes = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    })
    if (!tokenRes.ok) {
      const msg = await tokenRes.text()
      throw new Error(`Pluggy connect_token falhou: ${msg}`)
    }
    const { accessToken } = await tokenRes.json() as { accessToken: string }

    return NextResponse.json({ connectToken: accessToken })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar token de conexão.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
