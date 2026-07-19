import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/logo'
import { HeroLedger } from '@/components/marketing/hero-ledger'
import { Landmark, Repeat, Target, PieChart, Download, Bot } from 'lucide-react'

const steps = [
  {
    n: '01',
    title: 'Conecte ou registre',
    description: 'Ligue sua conta pelo Open Finance e as transações chegam sozinhas, ou lance manualmente em segundos.',
  },
  {
    n: '02',
    title: 'Converse com a IA',
    description: '"Onde gastei mais esse mês?" — pergunte em português e receba resposta, com o lançamento já pronto para confirmar.',
  },
  {
    n: '03',
    title: 'Veja com clareza',
    description: 'Orçamento, metas e recorrentes num painel só, sem abrir uma planilha.',
  },
]

const ledgerItems = [
  { icon: Landmark, label: 'Contas conectadas', detail: 'Open Finance via Pluggy — extrato sincronizado automaticamente' },
  { icon: Bot, label: 'Assistente de IA', detail: 'Pergunte sobre seus gastos e deixe a IA rascunhar o lançamento' },
  { icon: Target, label: 'Metas', detail: 'Defina um valor e acompanhe o progresso mês a mês' },
  { icon: PieChart, label: 'Orçamento por categoria', detail: 'Limites por categoria, com aviso antes de estourar' },
  { icon: Repeat, label: 'Lançamentos recorrentes', detail: 'Assinaturas e contas fixas registradas uma vez só' },
  { icon: Download, label: 'Exportar CSV', detail: 'Suas transações filtradas, prontas para o Excel' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Logo height={52} />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-8">
              100% gratuito · Sem cartão de crédito
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] mb-6 text-balance">
              Menos planilha.
              <br />
              <span className="text-blue-400">Mais clareza.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
              Conecte seu banco automaticamente, converse com a IA para lançar gastos e veja seu saldo
              em tempo real — sem mensalidade, sem cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base w-full sm:w-auto">
                  Criar conta grátis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 h-12 text-base w-full sm:w-auto">
                  Fazer login
                </Button>
              </Link>
            </div>
          </div>

          <HeroLedger />
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Como funciona</h2>
          <p className="text-slate-400 text-center mb-16 max-w-lg mx-auto">
            Três passos entre &ldquo;não sei pra onde vai meu dinheiro&rdquo; e um extrato que faz sentido.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step) => (
              <div key={step.n}>
                <span className="font-mono text-sm text-blue-400">{step.n}</span>
                <h3 className="font-semibold text-white text-lg mt-2 mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos — estilo lançamento de extrato */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Tudo que você precisa</h2>
          <p className="text-slate-400 text-center mb-14 max-w-lg mx-auto">
            Cada recurso, um lançamento no extrato da sua rotina financeira.
          </p>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800 overflow-hidden">
            {ledgerItems.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-900 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500 truncate">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Pronto para ver com clareza?</h2>
          <p className="text-slate-400 mb-8">Crie sua conta grátis e comece a controlar suas finanças agora.</p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-12 text-base">
              Começar gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm px-4">
        <div className="flex items-center justify-center mb-3">
          <Logo height={40} />
        </div>
        <p>© {new Date().getFullYear()} L-Finanças.</p>
      </footer>
    </div>
  )
}
