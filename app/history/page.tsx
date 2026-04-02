'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Activity, Clock } from 'lucide-react'

interface Measurement {
  id: string
  created_at: string
  result: {
    name: string
    speedKmh: number
    speedMs: number
    timeSeconds: number
  }
}

export default function HistoryPage() {
  const [tests, setTests] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTests(data as Measurement[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A2035] font-sans pb-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <header className="p-6 relative z-10 border-b border-white/5">
        <button 
          onClick={() => router.push('/')}
          className="text-cyan-100/60 flex items-center gap-2 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Dashboard
        </button>
      </header>

      <div className="max-w-md mx-auto p-4 relative z-10 mt-4 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Histórico de Medições</h1>
          <p className="text-cyan-100/70 text-sm">Acompanhe sua evolução</p>
        </div>

        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto mt-12"></div>
        ) : tests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10 mt-8">
            <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">Você ainda não salvou nenhum teste.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map(test => (
              <div key={test.id} className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col gap-3 transition-all hover:bg-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{test.result.name || 'Teste sem nome'}</h3>
                    <div className="flex items-center gap-1 text-xs text-cyan-100/60 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(test.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">
                      {test.result.speedKmh.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-cyan-400/50 ml-1">km/h</span>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <Activity className="w-4 h-4 text-cyan-400/50" />
                    {test.result.speedMs.toFixed(1)} m/s
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <Clock className="w-4 h-4 text-cyan-400/50" />
                    {test.result.timeSeconds.toFixed(2)} s
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
