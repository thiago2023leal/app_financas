'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LogOut, MoreHorizontal, X } from 'lucide-react'
import { NAV_ITEMS } from './nav-items'

const PRIMARY_NAV = NAV_ITEMS.slice(0, 4)
const MORE_NAV = NAV_ITEMS.slice(4)

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [moreOpen, setMoreOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isMoreActive = MORE_NAV.some(
    ({ href }) => pathname === href || pathname.startsWith(href + '/')
  )

  useEffect(() => {
    if (!moreOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moreOpen])

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800 fixed top-0 left-0 right-0 z-40">
        <div className="bg-white rounded-lg p-1">
          <Image src="/logo-lvision.png" alt="L-Vision Segurança Eletrônica" width={100} height={28} />
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Overlay — fecha ao clicar fora do sheet */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bottom sheet "Mais" — z-50 garante posição acima do overlay */}
      <div
        id="mobile-more-menu"
        role="dialog"
        aria-label="Mais opções de navegação"
        aria-modal={moreOpen}
        aria-hidden={!moreOpen}
        className={cn(
          'md:hidden fixed bottom-14 left-0 right-0 z-50',
          'bg-slate-900 border-t border-x border-slate-800 rounded-t-2xl',
          'transition-transform duration-200 ease-in-out',
          moreOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-800">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Mais</p>
          <button
            onClick={() => setMoreOpen(false)}
            aria-label="Fechar menu"
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="px-3 py-2" aria-label="Navegação secundária">
          {MORE_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex"
        aria-label="Navegação principal"
      >
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMoreOpen(false)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="truncate w-full text-center text-[10px]">{label}</span>
          </Link>
        ))}

        {/* Botão Mais */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
            isMoreActive || moreOpen
              ? 'text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>
    </>
  )
}
