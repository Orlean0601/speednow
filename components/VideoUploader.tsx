'use client';

import { Upload, Video, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  onUpload: (file: File) => void;
  onBack: () => void;
}

export function VideoUploader({ onUpload, onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-cyan-100/60 flex items-center gap-2 mb-4 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Gravar ou Enviar</h2>
        <p className="text-cyan-100/70 text-sm mt-2">Grave o momento do impacto ou escolha um vídeo da galeria</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all shadow-lg shadow-cyan-500/20"
        >
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <Video className="w-8 h-8" />
          </div>
          <span className="font-bold text-lg">Iniciar Gravação</span>
          <span className="text-sm text-white/70 font-normal">Usar a câmera do celular</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white/5 hover:bg-white/10 text-white p-8 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 transition-all backdrop-blur-md"
        >
          <div className="bg-white/10 p-4 rounded-full">
            <Upload className="w-8 h-8 text-cyan-400" />
          </div>
          <span className="font-bold text-lg">Selecionar Vídeo</span>
          <span className="text-sm text-white/50 font-normal">Escolher da galeria</span>
        </button>
      </div>

      <input
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleFileChange}
      />
      <input
        type="file"
        accept="video/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
