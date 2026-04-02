'use client';

import { Distances, AnalysisResult } from '@/lib/types';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Calculator, AlertCircle, FastForward } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Props {
  videoFile: File;
  distances: Distances;
  onComplete: (result: AnalysisResult) => void;
  onBack: () => void;
}

export function VideoAnalyzer({ videoFile, distances, onComplete, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const [fps, setFps] = useState<number>(30);
  const [startFrame, setStartFrame] = useState<number | null>(null);
  const [endFrame, setEndFrame] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seekFrame = (frames: number) => {
    if (videoRef.current) {
      const frameTime = 1 / fps;
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + frames * frameTime));
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const currentFrame = Math.round(currentTime * fps);

  const markStart = () => setStartFrame(currentFrame);
  const markEnd = () => setEndFrame(currentFrame);

  const calculateDistanceInMeters = () => {
    let dist = distances.attackerToTarget;
    if (distances.unit2 === 'steps') {
      dist = dist * distances.stepLength;
    }
    return dist;
  };

  const handleCalculate = () => {
    setError(null);
    const distanceMeters = calculateDistanceInMeters();
    
    if (distanceMeters <= 0) {
      setError('A distância deve ser maior que 0.');
      return;
    }
    
    if (startFrame === null || endFrame === null) {
      setError('Marque o início e o fim antes de calcular.');
      return;
    }

    if (endFrame <= startFrame) {
      setError('O frame final deve ser maior que o frame inicial.');
      return;
    }

    const timeSeconds = (endFrame - startFrame) / fps;
    
    if (timeSeconds <= 0) {
      setError('O tempo calculado é inválido (0 segundos).');
      return;
    }

    const speedMs = distanceMeters / timeSeconds;
    const speedKmh = speedMs * 3.6;

    onComplete({
      startFrame,
      endFrame,
      fps,
      timeSeconds,
      speedMs,
      speedKmh
    });
  };

  const cyclePlaybackRate = () => {
    const rates = [0.25, 0.5, 1];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="text-cyan-100/60 flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-cyan-100/80">FPS:</label>
          <select 
            value={fps} 
            onChange={(e) => setFps(Number(e.target.value))}
            className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value={24} className="bg-[#1A2035]">24</option>
            <option value={30} className="bg-[#1A2035]">30</option>
            <option value={60} className="bg-[#1A2035]">60</option>
            <option value={120} className="bg-[#1A2035]">120</option>
            <option value={240} className="bg-[#1A2035]">240</option>
          </select>
        </div>
      </div>

      <div className="bg-black/50 rounded-3xl overflow-hidden shadow-lg relative aspect-[9/16] max-h-[60vh] flex items-center justify-center border border-white/10">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            onClick={togglePlay}
          />
        )}
        
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-mono backdrop-blur-sm border border-white/10">
          Frame: {currentFrame}
        </div>
        
        <button 
          onClick={cyclePlaybackRate}
          className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10 flex items-center gap-1.5 hover:bg-black/80 transition-colors"
        >
          <FastForward className="w-4 h-4" />
          {playbackRate}x
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 space-y-5">
        {/* Timeline Slider */}
        <input
          type="range"
          min={0}
          max={duration}
          step={1 / fps}
          value={currentTime}
          onChange={(e) => {
            if (videoRef.current) {
              videoRef.current.currentTime = Number(e.target.value);
              setCurrentTime(Number(e.target.value));
            }
          }}
          className="w-full accent-cyan-400"
        />

        {/* Controls */}
        <div className="flex justify-center items-center gap-6">
          <button onClick={() => seekFrame(-1)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>
          <button onClick={togglePlay} className="p-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button onClick={() => seekFrame(1)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Markers */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={markStart}
            className={`py-3 px-2 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center transition-all ${startFrame !== null ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'}`}
          >
            <span>Marcar Início</span>
            {startFrame !== null && <span className="font-mono text-xs mt-1 text-cyan-200">Frame {startFrame}</span>}
          </button>
          <button 
            onClick={markEnd}
            className={`py-3 px-2 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center transition-all ${endFrame !== null ? 'border-blue-400 bg-blue-400/10 text-blue-300' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'}`}
          >
            <span>Marcar Fim</span>
            {endFrame !== null && <span className="font-mono text-xs mt-1 text-blue-200">Frame {endFrame}</span>}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button 
          onClick={handleCalculate}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/30"
        >
          <Calculator className="w-5 h-5" />
          Calcular Velocidade
        </button>
      </div>
    </div>
  );
}
