'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export function AIFab() {
  const pathname = usePathname()

  if (pathname === '/ai') return null

  return (
    <div className="group fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40">
      {/* Tooltip — desktop only */}
      <span className="
        pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2
        hidden md:block
        whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700
        px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150
      ">
        Assistente IA
      </span>

      <Link
        href="/ai"
        aria-label="Abrir Assistente IA"
        className="
          flex items-center justify-center
          w-12 h-12 md:w-14 md:h-14
          rounded-full shadow-lg shadow-blue-900/40
          bg-blue-600 hover:bg-blue-500
          text-white
          transition-all duration-200
          hover:scale-105
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        "
      >
        <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
      </Link>
    </div>
  )
}
