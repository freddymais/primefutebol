'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoundSelector } from '@/components/RoundSelector';
import { MatchCard } from '@/components/MatchCard';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ErrorCard, SkeletonCard } from '@/components/ui/BentoCard';
import type { Round, Match } from '@/lib/types';

export default function ProximasRodadasPage() {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const {
    data: rounds,
    isLoading,
    error,
    refetch,
  } = useQuery<Round[]>({
    queryKey: ['upcomingRounds'],
    queryFn: async () => {
      const res = await fetch('/api/matches/upcoming');
      if (!res.ok) throw new Error('Erro ao carregar rodadas');
      const data = await res.json();
      return data;
    },
  });

  const currentRoundNumber = rounds?.find((r) => r.isCurrent)?.number;

  // Se não tiver rodada selecionada, usa a atual ou a primeira disponível
  const effectiveRound = selectedRound || currentRoundNumber || rounds?.[0]?.number || 1;

  // Filtra as partidas da rodada selecionada
  const selectedRoundData = rounds?.find((r) => r.number === effectiveRound);
  const matches = selectedRoundData?.matches || [];

  // Alterna entre visualização de uma rodada específica e todas as rodadas
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">
            Próximas Rodadas
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Calendário completo de jogos do Brasileirão Série A
          </p>
        </div>
        <button
          onClick={() => {
            if (viewMode === 'all') {
              setSelectedRound(null);
              setViewMode('single');
            } else {
              setViewMode('all');
            }
          }}
          title={viewMode === 'all' ? 'Voltar para rodada atual' : 'Ver todas as rodadas'}
          className={`
            flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200 whitespace-nowrap
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400
            ${viewMode === 'all'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'bg-white/[0.04] text-white/50 border border-transparent hover:bg-white/10 hover:text-white/70'
            }
          `}
        >
          {viewMode === 'all' ? 'Rodada Atual' : 'Todas as Rodadas'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} lines={5} />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorCard
          message="Erro ao carregar as rodadas. Tente novamente."
          onRetry={() => refetch()}
        />
      ) : !rounds || rounds.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-4">📅</span>
          <p className="text-white/50 text-lg font-medium">Nenhuma rodada disponível</p>
          <p className="text-white/30 text-sm mt-1">
            Clique em "Sincronizar" no Dashboard para carregar os dados.
          </p>
        </div>
      ) : (
        <>
          {/* Seletor de rodadas */}
          <RoundSelector
            rounds={rounds.map((r) => ({ number: r.number, isCurrent: r.isCurrent }))}
            selectedRound={viewMode === 'all' ? (currentRoundNumber || rounds?.[0]?.number || 1) : effectiveRound}
            onSelectRound={(round) => {
              setSelectedRound(round);
              setViewMode('single');
            }}
          />

          {/* Grid de partidas */}
          {viewMode === 'single' ? (
            <GlassPanel title={`Rodada ${effectiveRound} — Jogos`} icon="⚽">
              {matches.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">
                  Nenhuma partida encontrada para esta rodada.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </GlassPanel>
          ) : (
            <div className="space-y-6">
              {rounds.map((round) => (
                <GlassPanel key={round.id} title={`Rodada ${round.number}`} icon="⚽">
                  {round.matches.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-6">
                      Nenhuma partida nesta rodada.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {round.matches.map((match) => (
                        <MatchCard key={match.id} match={match} compact />
                      ))}
                    </div>
                  )}
                </GlassPanel>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
