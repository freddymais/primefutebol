import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PrimeFutebol — Campeonato Brasileiro Série A',
  description: 'Dashboard moderno com classificação ao vivo, jogos da rodada e calendário do Campeonato Brasileiro Série A.',
  keywords: ['futebol', 'brasileirão', 'série a', 'classificação', 'resultados'],
  openGraph: {
    title: 'PrimeFutebol',
    description: 'Acompanhe o Brasileirão Série A em tempo real',
    type: 'website',
  },
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚽</text></svg>', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="pt-BR" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
      <body className="bg-[#0B0E14] text-white/90 antialiased">
        <Providers>
          <div className="bg-noise min-h-screen relative">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none z-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 230, 118, 0.08), transparent),
                  radial-gradient(ellipse 60% 40% at 80% 20%, rgba(68, 138, 255, 0.06), transparent),
                  radial-gradient(ellipse 60% 40% at 20% 30%, rgba(255, 214, 0, 0.04), transparent),
                  radial-gradient(ellipse 70% 50% at 50% 80%, rgba(0, 230, 118, 0.03), transparent)
                `,
              }}
            />

            {/* Header */}
            <header className="relative z-10 border-b border-white/[0.06]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex items-center justify-center w-9 h-9">
                      <img src="/logoPrime.png" alt="PrimeFutebol" className="w-9 h-9 object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-white/90 leading-tight tracking-tight">
                        Prime<span className="text-emerald-400">Futebol</span>
                      </span>
                      <span className="text-[10px] text-white/30 font-medium leading-tight hidden sm:block">
                        Brasileirão Série A
                      </span>
                    </div>
                  </Link>

                  {/* Navigation */}
                  <nav className="flex items-center gap-1">
                    <Link
                      href="/"
                      className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/5 rounded-lg transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/proximas-rodadas"
                      className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/5 rounded-lg transition-all duration-200"
                    >
                      Próximas Rodadas
                    </Link>
                  </nav>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.06] mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white/30">
                      Prime<span className="text-emerald-400/50">Futebol</span>
                    </span>
                    <span className="text-white/20 text-xs">•</span>
                    <span className="text-xs text-white/20">
                      Campeonato Brasileiro Série A
                    </span>
                  </div>
                  <p className="text-xs text-white/20">
                    Primefox Soluções em T.I.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
