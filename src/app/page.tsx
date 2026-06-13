import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, Shield, Download, Smartphone, Zap } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Dashboard Visual',
    description: 'Cards de resumo e gráficos de pizza por categoria para enxergar onde seu dinheiro vai.',
  },
  {
    icon: Shield,
    title: 'Dados Seguros',
    description: 'Autenticação com Supabase e Row Level Security — só você acessa seus dados.',
  },
  {
    icon: Download,
    title: 'Exportar CSV',
    description: 'Exporte suas transações filtradas em .csv com um clique para análise no Excel.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Interface 100% responsiva que funciona perfeitamente no celular e no desktop.',
  },
  {
    icon: Zap,
    title: 'Rápido e Simples',
    description: 'Cadastre transações em segundos com categorias pré-definidas e formulário intuitivo.',
  },
  {
    icon: TrendingUp,
    title: 'Controle Total',
    description: 'Filtre por mês, categoria ou busque por descrição e tenha visão completa do seu financeiro.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">FinançasPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-24 md:py-36 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          100% gratuito · Sem cartão de crédito
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
          Controle suas finanças com{' '}
          <span className="text-blue-400">clareza e simplicidade</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Registre receitas e despesas, visualize gráficos por categoria e exporte relatórios — tudo em um web app moderno e seguro.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base">
              Criar conta grátis
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 h-12 text-base">
              Fazer login
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Tudo que você precisa</h2>
          <p className="text-slate-400 text-center mb-14 max-w-lg mx-auto">
            Uma plataforma completa para organizar e visualizar sua vida financeira.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-900 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-slate-400 mb-8">Crie sua conta grátis e comece a controlar suas finanças agora.</p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-12 text-base">
              Começar gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span className="text-slate-300 font-medium">FinançasPro</span>
        </div>
        <p>© {new Date().getFullYear()} FinançasPro. Controle financeiro pessoal.</p>
      </footer>
    </div>
  )
}
