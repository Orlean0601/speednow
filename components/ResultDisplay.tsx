'use client';

import { AnalysisResult } from '@/lib/types';
import { RotateCcw, Save, Trophy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { storage } from '@/lib/storage';

interface Props {
  result: AnalysisResult;
  onRestart: () => void;
}

export function ResultDisplay({ result, onRestart }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSaveClick = () => {
    setIsSaving(true);
  };

  const confirmSave = async () => {
    if (!testName) {
      alert('Por favor, insira um nome para o teste.');
      return;
    }

    setIsSaving(true);
    
    // Pegar o usuário atual no cliente local e salvar no supabase
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('measurements').insert({
          user_id: user.id,
          result: {
            name: testName,
            speedKmh: result.speedKmh,
            speedMs: result.speedMs,
            timeSeconds: result.timeSeconds,
          }
        });
      }

      setIsSaving(false);
      setIsSaved(true);
    } catch (err) {
      console.error('Erro ao salvar no supabase', err);
      setIsSaving(false);
      alert('Erro ao salvar o teste.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full mb-4 shadow-lg shadow-cyan-500/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Resultado</h2>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        
        <p className="text-cyan-100/60 font-medium uppercase tracking-wider text-sm mb-2">Velocidade Atingida</p>
        <div className="flex items-baseline justify-center gap-2 mb-8">
          <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-200 tracking-tighter">
            {result.speedKmh.toFixed(1)}
          </span>
          <span className="text-2xl font-bold text-cyan-400">km/h</span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-cyan-100/50 text-xs font-semibold uppercase tracking-wider mb-1">Velocidade</p>
            <p className="text-xl font-bold text-white">{result.speedMs.toFixed(2)} <span className="text-sm text-white/50 font-normal">m/s</span></p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-cyan-100/50 text-xs font-semibold uppercase tracking-wider mb-1">Tempo Voo</p>
            <p className="text-xl font-bold text-white">{result.timeSeconds.toFixed(3)} <span className="text-sm text-white/50 font-normal">s</span></p>
          </div>
        </div>
        
        <div className="mt-4 bg-white/5 rounded-2xl p-4 text-left border border-white/5">
          <p className="text-cyan-100/50 text-xs font-semibold uppercase tracking-wider mb-2">Detalhes Técnicos</p>
          <div className="flex justify-between text-sm text-white/80">
            <span>Frames:</span>
            <span className="font-mono text-cyan-200">{result.startFrame} → {result.endFrame}</span>
          </div>
          <div className="flex justify-between text-sm text-white/80 mt-1">
            <span>Taxa de Quadros:</span>
            <span className="font-mono text-cyan-200">{result.fps} FPS</span>
          </div>
        </div>
      </div>

      {isSaving ? (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold text-white text-lg">Salvar Resultado</h3>
          <div>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Nome do Teste (Ex: Saque Viagem)"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
            />
          </div>
          <div>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-400 outline-none transition-all [color-scheme:dark]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsSaving(false)}
              className="flex-1 bg-white/10 text-white font-bold py-4 rounded-full hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmSave}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-full hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30"
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-4">
          {isSaved ? (
            <div className="w-full bg-green-500/20 text-green-300 font-bold py-4 rounded-full flex items-center justify-center gap-2 border border-green-500/30 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5" />
              Salvo no Histórico!
            </div>
          ) : (
            <button 
              onClick={handleSaveClick}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30"
            >
              <Save className="w-5 h-5" />
              Salvar Resultado
            </button>
          )}
          <button 
            onClick={onRestart}
            className="w-full bg-white/10 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm"
          >
            <RotateCcw className="w-5 h-5" />
            Nova Medição
          </button>
        </div>
      )}
    </div>
  );
}
