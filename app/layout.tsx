import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { SplashScreen } from '@/components/SplashScreen';

export const metadata: Metadata = {
  title: 'SPEEDNOW',
  description: 'Calcula a velocidade de uma bola a partir de um vídeo gravado pelo usuário.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#1A2035] text-white antialiased" suppressHydrationWarning>
        <SplashScreen>
          {children}
        </SplashScreen>
      </body>
    </html>
  );
}
