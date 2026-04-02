'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { LogOut, History, Zap, Play, Crown, AlertTriangle } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  credits: number
  plan: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check access via RPC
      const { data: accessStatus, error: accessErr } = await supabase.rpc('check_user_access', { uid: user.id })
      
      if (accessStatus === 'blocked') {
        router.push('/blocked')
        return
      }
      
      if (accessStatus === 'expired') {
        // Tratar status expirado - já foi revertido pra free
      }

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(profileData as UserProfile)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleMeasure = async () => {
    if (!profile) return
    setActionLoading(true)
    
    // Se for free, precisa consmuir credito
    if (profile.plan === 'free') {
      const { data: consumed, error } = await supabase.rpc('consume_credit', { uid: profile.id })
      if (!consumed) {
        router.push('/blocked')
        setActionLoading(false)
        return
      }
    }
    
    // Tem crédito ou é pro
    router.push('/medir') // Vai para a página de medição
  }

  const handleUpgradePRO = async () => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Usuário não autenticado')
        router.push('/login')
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
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A2035] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!profile) return null

  const isFree = profile.plan === 'free'

  return (
    <main className="min-h-screen bg-[#1A2035] font-sans relative overflow-hidden pb-12">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <header className="p-6 flex items-center justify-between relative z-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SpeedNow" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">SPEEDNOW</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-cyan-100/60 hover:text-white transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-md mx-auto p-4 relative z-10 mt-6 space-y-6">
        
        {/* User Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
          <p className="text-cyan-100/60 text-sm mb-4">{profile.email}</p>
          
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isFree ? 'bg-white/10 text-white/80' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20'}`}>
            Plano {profile.plan}
          </div>
        </motion.div>

        {/* Medidor de Créditos */}
        {isFree && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md rounded-3xl border border-cyan-500/20 p-6"
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-cyan-100/60 text-xs font-semibold uppercase tracking-wider mb-1">Seus Créditos</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{profile.credits}</span>
                  <span className="text-cyan-400 font-medium text-sm">sobrando</span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-cyan-400 mb-1" />
            </div>
            
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((profile.credits / 3) * 100, 100)}%` }}
              ></div>
            </div>
          </motion.div>
        )}

        {/* Botoes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 pt-4"
        >
          <button
            onClick={handleMeasure}
            disabled={actionLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-3 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 group"
          >
            <Play className="w-6 h-6 fill-white drop-shadow-md group-hover:scale-110 transition-transform" />
            <span className="text-lg">Medir AGORA</span>
          </button>

          {isFree && (
            <button
              onClick={handleUpgradePRO}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/30"
            >
              <Crown className="w-5 h-5 fill-white/20" />
              Ativar Plano PRO
            </button>
          )}

          <button
            onClick={() => router.push('/history')}
            className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <History className="w-5 h-5" />
            Histórico das Medições
          </button>
        </motion.div>

      </div>
    </main>
  )
}
