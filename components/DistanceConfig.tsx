'use client';

import { Distances, DistanceUnit } from '@/lib/types';
import { Camera, Target, Settings, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  distances: Distances;
  onChange: (d: Distances) => void;
  onNext: () => void;
}

export function DistanceConfig({ distances, onChange, onNext }: Props) {
  const [showSettings, setShowSettings] = useState(false);

  const updateField = (field: keyof Distances, value: any) => {
    onChange({ ...distances, [field]: value });
  };

  const isValid = distances.attackerToTarget > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Configuração</h2>
        <p className="text-cyan-100/70 text-sm mt-2">Defina as distâncias para o cálculo da velocidade</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-divide/10 p-6 space-y-5 border-white/10 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-cyan-500/20 p-3 rounded-full">
            <Target className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Atacante até Alvo</h3>
        </div>
        
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            step="0.1"
            value={distances.attackerToTarget || ''}
            onChange={(e) => updateField('attackerToTarget', parseFloat(e.target.value) || 0)}
            placeholder="Ex: 10"
            className="flex-1 w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
          />
          <select
            value={distances.unit2}
            onChange={(e) => updateField('unit2', e.target.value as DistanceUnit)}
            className="bg-[#1A2035] border border-white/20 text-white rounded-2xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 outline-none"
          >
            <option value="meters">Metros</option>
            <option value="steps">Passos</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-cyan-100/60 flex items-center gap-2 text-sm hover:text-cyan-300 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configurar tamanho do passo
        </button>
      </div>

      {showSettings && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-cyan-100/80 mb-3">
            Tamanho de 1 passo (em metros)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.05"
            value={distances.stepLength}
            onChange={(e) => updateField('stepLength', parseFloat(e.target.value) || 0.75)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 mt-4"
      >
        Continuar
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
