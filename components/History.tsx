'use client';

import { storage, SavedTest } from '@/lib/storage';
import { ArrowLeft, Calendar, Activity, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  onBack: () => void;
}

export function History({ onBack }: Props) {
  const [tests, setTests] = useState<SavedTest[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTests(storage.getSavedTests());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-cyan-100/60 flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <h2 className="text-xl font-bold text-white">Histórico</h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-cyan-100/70 text-sm">Acompanhe sua evolução</p>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10">
          <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Você ainda não salvou nenhum teste.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map(test => (
            <div key={test.id} className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col gap-3 transition-all hover:bg-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{test.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-cyan-100/60 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(test.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">{test.speedKmh.toFixed(1)}</span>
                  <span className="text-xs font-bold text-cyan-400/50 ml-1">km/h</span>
                </div>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-3">
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Activity className="w-4 h-4 text-cyan-400/50" />
                  {test.speedMs.toFixed(1)} m/s
                </div>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Clock className="w-4 h-4 text-cyan-400/50" />
                  {test.timeSeconds.toFixed(2)} s
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
