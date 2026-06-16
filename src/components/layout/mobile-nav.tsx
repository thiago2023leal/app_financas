'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { NAV_ITEMS } from './nav-items'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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

      {/* Mobile bottom nav — mostra apenas os 4 primeiros itens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex">
        {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
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
      </nav>
    </>
  )
}
