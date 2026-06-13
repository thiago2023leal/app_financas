import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinançasPro — Controle Financeiro Pessoal',
  description: 'Registre receitas e despesas, visualize gráficos por categoria e exporte relatórios financeiros.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} antialiased bg-slate-950 text-white`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
