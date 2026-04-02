'use client';

import { useState } from 'react';
import { DistanceConfig } from '@/components/DistanceConfig';
import { VideoUploader } from '@/components/VideoUploader';
import { VideoAnalyzer } from '@/components/VideoAnalyzer';
import { ResultDisplay } from '@/components/ResultDisplay';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Distances, DistanceUnit, AnalysisResult } from '@/lib/types';

// Re-export types for backward compatibility
export type { DistanceUnit, Distances, AnalysisResult };

export default function Home() {
  const [step, setStep] = useState<'config' | 'upload' | 'analyze' | 'result'>('config');
  const router = useRouter();
  const [distances, setDistances] = useState<Distances>({
    cameraToAttacker: 0,
    attackerToTarget: 0,
    unit1: 'meters',
    unit2: 'meters',
    stepLength: 0.75,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  return (
    <main className="min-h-screen bg-[#1A2035] text-white font-sans relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <header className="p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SpeedNow" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">SPEEDNOW</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 text-cyan-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Voltar para Dashboard"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 pb-20 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">


          {step === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DistanceConfig
                distances={distances}
                onChange={setDistances}
                onNext={() => setStep('upload')}
              />
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VideoUploader
                onUpload={(file) => {
                  setVideoFile(file);
                  setStep('analyze');
                }}
                onBack={() => setStep('config')}
              />
            </motion.div>
          )}

          {step === 'analyze' && videoFile && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VideoAnalyzer
                videoFile={videoFile}
                distances={distances}
                onComplete={(result) => {
                  setAnalysisResult(result);
                  setStep('result');
                }}
                onBack={() => setStep('upload')}
              />
            </motion.div>
          )}

          {step === 'result' && analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ResultDisplay
                result={analysisResult}
                onRestart={() => {
                  router.push('/');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
