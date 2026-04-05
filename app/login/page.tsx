'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
            emailRedirectTo: `${location.origin}/auth/confirm`,
          },
        })
        if (error) throw error
        // Para simplificar, direciona pro dashboard após cadastro se logado auto.
        // Se precisar de conf. email, apenas exibimos mensagem
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A2035] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center text-white flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="SpeedNow" 
            className="w-28 h-28 object-contain mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:scale-105 transition-transform" 
          />
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white mb-2">SPEEDNOW</h1>
          <p className="text-cyan-100/60">Sua plataforma de análise de velocidade</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 p-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${isLogin ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${!isLogin ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold text-cyan-100/60 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-cyan-100/60 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-cyan-100/60 uppercase tracking-wider mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded-xl p-3 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  )
}
