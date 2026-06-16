'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12">
        <div className="bg-white rounded-xl p-2">
          <Image src="/logo-lvision.png" alt="L-Vision Segurança Eletrônica" width={142} height={40} />
        </div>
        <div>
          <blockquote className="text-slate-300 text-xl leading-relaxed mb-6">
            "Controle total das suas finanças em um só lugar. Receitas, despesas e saldo sempre na palma da mão."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              T
            </div>
            <div>
              <p className="text-white font-medium text-sm">Thiago Leal</p>
              <p className="text-slate-400 text-xs">Cliente L-Vision</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <div className="bg-white rounded-xl p-2 inline-block">
              <Image src="/logo-lvision.png" alt="L-Vision Segurança Eletrônica" width={128} height={36} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-slate-400 mb-8">Entre na sua conta para continuar</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
