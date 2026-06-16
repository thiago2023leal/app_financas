'use client'

import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { OF_ACCOUNTS_KEY, OF_CONNECTIONS_KEY } from '@/lib/hooks/use-of-accounts'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// PluggyConnect Widget — carregado via script CDN
// https://docs.pluggy.ai/docs/pluggy-connect
declare global {
  interface Window {
    PluggyConnect?: new (config: PluggyConnectConfig) => PluggyConnectInstance
  }
}

interface PluggyConnectConfig {
  connectToken: string
  includeSandbox?: boolean
  onSuccess: (data: { item: { id: string } }) => void
  onError: (error: { message: string }) => void
  onClose: () => void
}

interface PluggyConnectInstance {
  init: () => void
  destroy: () => void
}

const PLUGGY_SCRIPT_ID = 'pluggy-connect-script'
const PLUGGY_SCRIPT_SRC = 'https://cdn.pluggy.ai/pluggy-connect/latest/pluggy-connect.js'

function loadPluggyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('SSR')); return }
    if (window.PluggyConnect) { resolve(); return }

    const existing = document.getElementById(PLUGGY_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Pluggy Widget.')))
      return
    }

    const script = document.createElement('script')
    script.id = PLUGGY_SCRIPT_ID
    script.src = PLUGGY_SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar Pluggy Widget.'))
    document.head.appendChild(script)
  })
}

interface PluggyConnectButtonProps {
  onConnected?: (connectionId: string, synced: number) => void
}

export function PluggyConnectButton({ onConnected }: PluggyConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const instanceRef = useRef<PluggyConnectInstance | null>(null)

  async function handleConnect() {
    setLoading(true)
    try {
      // 1. Obter connectToken do backend (credenciais nunca saem do servidor)
      const tokenRes = await fetch('/api/of/connect-token')
      if (!tokenRes.ok) {
        const { error } = await tokenRes.json().catch(() => ({ error: 'Erro ao obter token.' }))
        throw new Error(error)
      }
      const { connectToken } = await tokenRes.json() as { connectToken: string }

      // 2. Carregar script do Widget
      await loadPluggyScript()

      if (!window.PluggyConnect) throw new Error('Pluggy Widget não disponível.')

      // 3. Inicializar Widget — React StrictMode pode montar duas vezes:
      //    instanceRef garante que só uma instância fica ativa.
      instanceRef.current?.destroy()
      instanceRef.current = new window.PluggyConnect({
        connectToken,
        includeSandbox: true,
        onSuccess: async ({ item }) => {
          try {
            const syncRes = await fetch('/api/of/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: item.id }),
            })
            if (!syncRes.ok) {
              const { error } = await syncRes.json().catch(() => ({ error: 'Erro na sincronização.' }))
              throw new Error(error)
            }
            const { connectionId, synced } = await syncRes.json() as { connectionId: string; synced: number }

            await Promise.all([
              queryClient.invalidateQueries({ queryKey: OF_ACCOUNTS_KEY }),
              queryClient.invalidateQueries({ queryKey: OF_CONNECTIONS_KEY }),
            ])

            const label = synced === 1 ? '1 conta sincronizada.' : `${synced} contas sincronizadas.`
            toast.success(label)
            onConnected?.(connectionId, synced)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro na sincronização.')
          } finally {
            setLoading(false)
          }
        },
        onError: ({ message }) => {
          toast.error(`Erro na conexão: ${message}`)
          setLoading(false)
        },
        onClose: () => {
          setLoading(false)
        },
      })

      instanceRef.current.init()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao conectar banco.')
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      variant="outline"
      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Building2 className="w-4 h-4" />}
      Conectar banco
    </Button>
  )
}
