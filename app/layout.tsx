import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';
import ProgressiveBlur from '@/components/ProgressiveBlur';
import './globals.css';

export const metadata: Metadata = {
  title: 'clonajá',
  description: 'Clone e traduza.',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* Extensões de browser (ColorZilla, Grammarly e afins) injetam
          atributos no <body> antes do React hidratar — o ColorZilla põe
          cz-shortcut-listen="true". Isso gera um falso positivo de
          hydration mismatch que não existe para o visitante final.
          O supressor vale só para os atributos e o texto direto deste
          elemento; divergências reais dentro da árvore continuam
          sendo reportadas normalmente. */}
      <body suppressHydrationWarning>
        <Navbar />
        {children}
        {/* Depois do Footer (que fecha {children}), fora de qualquer
            <main> — camada fixa de blur, não faz parte do fluxo da página. */}
        <ProgressiveBlur />
      </body>
    </html>
  );
}
