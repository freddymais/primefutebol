import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import './globals.css';
import { Providers } from './providers';
import { AdminPanel } from '@/components/AdminPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PrimeFutebol — Campeonato Brasileiro Série A',
  description: 'Classificação ao vivo, jogos da rodada e calendário do Campeonato Brasileiro Série A.',
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
      <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg text-fg antialiased`}>
        <Providers>
          <div className="bg-noise min-h-screen relative">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none z-0" />

            {/* Header */}
            <header className="relative z-10 border-b border-border transition-theme">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex items-center justify-center w-9 h-9">
                      <Image src="/logoPrime.png" alt="PrimeFutebol" width={36} height={36} className="w-9 h-9 object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-fg leading-tight tracking-tight">
                        Prime<span className="text-accent-text">Futebol</span>
                      </span>
                      <span className="text-[10px] text-fg-muted font-medium leading-tight hidden sm:block">
                        Brasileirão Série A
                      </span>
                    </div>
                  </Link>

                  {/* Navigation + Theme Toggle */}
                  <div className="flex items-center gap-1">
                    <nav className="flex items-center gap-1">
                      <Link
                        href="/"
                        className="px-4 py-2 text-sm font-medium text-fg-secondary hover:text-fg hover:bg-surface-hover rounded-lg transition-all duration-200"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/proximas-rodadas"
                        className="px-4 py-2 text-sm font-medium text-fg-secondary hover:text-fg hover:bg-surface-hover rounded-lg transition-all duration-200"
                      >
                        Rodadas
                      </Link>
                    </nav>
                    <div className="ml-1">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border mt-12 transition-theme">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-fg-muted">
                      Prime<span className="text-accent-text">Futebol</span>
                    </span>
                    <span className="text-fg-faint text-xs">•</span>
                    <span className="text-xs text-fg-faint">
                      Campeonato Brasileiro Série A
                    </span>
                  </div>
                  <p className="text-xs text-fg-faint">
                    Primefox Soluções em T.I.
                  </p>
                </div>
              </div>
            </footer>
          </div>
          <AdminPanel />
        </Providers>
      </body>
    </html>
  );
}
