import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-mono-figures' })

export const metadata: Metadata = {
  title: 'L-Finanças — Controle suas finanças com clareza',
  description: 'L-Finanças é um app gratuito para controlar receitas e despesas, visualizar gráficos por categoria e exportar relatórios.',
  openGraph: {
    title: 'L-Finanças — Controle suas finanças com clareza',
    description: 'Registre receitas e despesas, visualize gráficos por categoria e exporte relatórios — tudo em um web app moderno e seguro.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary',
    title: 'L-Finanças — Controle suas finanças com clareza',
    description: 'Registre receitas e despesas, visualize gráficos por categoria e exporte relatórios — tudo em um web app moderno e seguro.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${archivo.className} ${jetbrainsMono.variable} antialiased bg-slate-950 text-white`}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
