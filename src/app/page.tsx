'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorersTable, TopScorersTableSkeleton } from '@/components/TopScorersTable';
import { MatchCard, MatchCardSkeleton } from '@/components/MatchCard';
import { SyncButton } from '@/components/SyncButton';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ErrorCard } from '@/components/ui/BentoCard';
import type { Standing, Match, TopScorerData } from '@/lib/types';

interface CurrentRoundData {
  round: { id: number; number: number } | null;
  matches: Match[];
}

export default function DashboardPage() {
  const {
    data: standings,
    isLoading: standingsLoading,
    error: standingsError,
    refetch: refetchStandings,
  } = useQuery<Standing[]>({
    queryKey: ['standings'],
    queryFn: async () => {
      const res = await fetch('/api/standings');
      if (!res.ok) throw new Error('Erro ao carregar classificação');
      return res.json();
    },
  });

  const {
    data: currentRound,
    isLoading: roundLoading,
    error: roundError,
    refetch: refetchRound,
  } = useQuery<CurrentRoundData>({
    queryKey: ['currentRound'],
    queryFn: async () => {
      const res = await fetch('/api/matches/current-round');
      if (!res.ok) throw new Error('Erro ao carregar rodada atual');
      return res.json();
    },
  });

  const {
    data: scorers,
    isLoading: scorersLoading,
    error: scorersError,
    refetch: refetchScorers,
  } = useQuery<TopScorerData[]>({
    queryKey: ['scorers'],
    queryFn: async () => {
      const res = await fetch('/api/scorers');
      if (!res.ok) throw new Error('Erro ao carregar artilheiros');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">
            Brasileirão {new Date().getMonth() + 1 < 4 ? new Date().getFullYear() - 1 : new Date().getFullYear()}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Acompanhe a classificação e os jogos ao vivo do Brasileirão Série A
          </p>
        </div>
        <SyncButton />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Classificação — ocupa 2 colunas no desktop */}
        <div className="lg:col-span-2 h-full">
          <GlassPanel title="Classificação" icon="🏆">
            <StandingsTable
              standings={standings || []}
              loading={standingsLoading}
              error={standingsError ? 'Não foi possível carregar a classificação.' : null}
              onRetry={() => refetchStandings()}
            />
          </GlassPanel>
        </div>

        {/* Rodada Atual — ocupa 1 coluna no desktop */}
        <div className="lg:col-span-1 h-full">
          <GlassPanel
            title={currentRound?.round ? `Rodada ${currentRound.round.number}` : 'Rodada Atual'}
            icon="⚽"
          >
            {roundLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MatchCardSkeleton key={i} />
                ))}
              </div>
            ) : roundError ? (
              <ErrorCard
                message="Erro ao carregar jogos da rodada."
                onRetry={() => refetchRound()}
              />
            ) : !currentRound?.matches || currentRound.matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2">📅</span>
                <p className="text-white/40 text-sm">Nenhum jogo na rodada atual.</p>
                  <p className="text-white/30 text-xs mt-1">
                    Os dados são sincronizados automaticamente a cada 90s.
                  </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 flex-1">
                {currentRound.matches.map((match) => (
                  <div key={match.id} className="flex-1 flex">
                    <MatchCard match={match} compact/>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Legenda */}
      <div className="glass p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/40">
          <span className="flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-zone-libertadores" />
            G4 — Libertadores (grupo)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-zone-prelibertadores" />
            G6 — Pré-Libertadores
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-zone-sulamericana" />
            Sul-americana
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-zone-rebaixamento" />
            Z4 — Rebaixamento
          </span>
        </div>
      </div>

      {/* Artilheiros — 2 colunas no desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <GlassPanel title="Artilheiros" icon="⚡">
            <TopScorersTable
              scorers={scorers || []}
              loading={scorersLoading}
              error={scorersError ? 'Não foi possível carregar os artilheiros.' : null}
              onRetry={() => refetchScorers()}
            />
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
