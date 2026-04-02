'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { Crown, ZapOff, ArrowLeft, Plus } from 'lucide-react'

export default function BlockedPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpgradePRO = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }

      console.log('Chamando create_pro_checkout para user:', user.id)

      const { data, error } = await supabase.functions.invoke('create_pro_checkout', {
        body: { user_id: user.id, email: user.email }
      })

      console.log('Resposta checkout PRO:', { data, error })

      if (error) {
        console.error('Erro na function:', error)
        return
      }

      if (data?.init_point) {
        window.location.href = data.init_point
      } else {
        console.error('Resposta sem init_point:', data)
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCredits = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }

      console.log('Chamando create_credits_checkout para user:', user.id)

      const { data, error } = await supabase.functions.invoke('create_credits_checkout', {
        body: { user_id: user.id, email: user.email }
      })

      console.log('Resposta checkout créditos:', { data, error })

      if (error) {
        console.error('Erro na function:', error)
        return
      }

      if (data?.init_point) {
        window.location.href = data.init_point
      } else {
        console.error('Resposta sem init_point:', data)
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A2035] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 text-center relative z-10"
      >
        <button 
          onClick={() => router.push('/dashboard')}
          className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
          <ZapOff className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Seus créditos acabaram!</h1>
        <p className="text-cyan-100/60 mb-8 max-w-sm mx-auto">
          Para continuar medindo suas velocidades top, você precisa de mais créditos ou do acesso ilimitado.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleBuyCredits}
            disabled={loading}
            className="w-full bg-white/10 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
          >
            <Plus className="w-5 h-5" />
            Comprar 3 Créditos
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#1f2845] px-3 text-xs text-white/40 font-semibold uppercase tracking-widest">Ou</span>
            </div>
          </div>

          <button
            onClick={handleUpgradePRO}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-2 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/30"
          >
            <Crown className="w-6 h-6 fill-white/20" />
            <span className="text-lg">Ativar Plano PRO Ilimitado</span>
          </button>
        </div>
      </motion.div>
    </main>
  )
}
