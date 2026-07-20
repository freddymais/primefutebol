'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Match, MatchStatus, Goal } from '@/lib/types';
import { formatMatchDateTime, getLiveMinutes } from '@/lib/types';
import { Badge } from './ui/Badge';
import { SkeletonCard } from './ui/BentoCard';
import { GlassPanel } from './ui/GlassPanel';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const { homeTeam, awayTeam, homeScore, awayScore, status, matchDatetime, venue } = match;
  const [showGoals, setShowGoals] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLive = status === 'live';
  const isFinished = status === 'finished';
  const isScheduled = status === 'scheduled';
  const hasGoals = (isLive || isFinished) && match.goals && match.goals.length > 0;
  const liveMinutes = getLiveMinutes(matchDatetime, status);

  useEffect(() => {
    if (!showGoals) return;
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowGoals(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGoals]);

  function handleCardClick() {
    if (hasGoals) {
      setShowGoals((prev) => !prev);
    }
  }

  return (
    <div ref={cardRef} className="relative w-full flex">
      <div
        onClick={handleCardClick}
        className={`glass-card-sm transition-all duration-300 w-full flex flex-col justify-center ${
          compact ? 'py-3 px-4' : 'py-4 px-5'
        } ${hasGoals ? 'cursor-pointer hover:bg-surface-hover' : ''} ${
          showGoals ? 'ring-1 ring-border-hover bg-surface' : ''
        }`}
      >
        {/* Status / Horario */}
        <div className={`flex items-center justify-between ${compact ? 'mb-2.5' : 'mb-3'}`}>
          {isLive ? (
            <Badge variant="live" pulsating>
              AO VIVO {liveMinutes !== null && `• ${liveMinutes}'`}
            </Badge>
          ) : isFinished ? (
            <Badge variant="success">Encerrado</Badge>
          ) : isScheduled ? (
            <span className="text-xs text-fg-muted">{formatMatchDateTime(matchDatetime)}</span>
          ) : (
            <Badge variant="warning">Adiado</Badge>
          )}
        </div>

        {/* Times e Placar */}
        <div className="flex items-center justify-between gap-2">
          {/* Time Casa */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`rounded-full bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden ${compact ? 'w-7 h-7' : 'w-8 h-8'}`}>
              {homeTeam.logoUrl ? (
                <Image src={homeTeam.logoUrl} alt={homeTeam.name} width={28} height={28} className={`object-contain ${compact ? 'w-6 h-6' : 'w-7 h-7'}`} />
              ) : (
                <span className="text-[10px] font-bold text-fg-muted">
                  {(homeTeam.shortName || homeTeam.name).slice(0, 2)}
                </span>
              )}
            </div>
            <span className={`font-medium truncate ${isLive ? 'text-fg' : 'text-fg-secondary'} ${compact ? 'text-xs' : 'text-sm'}`}>
              {homeTeam.shortName || homeTeam.name}
            </span>
          </div>

          {/* Placar */}
          <div className="flex-shrink-0 text-center">
            {isScheduled ? (
              <span className="text-xs text-fg-faint font-medium">vs</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`${compact ? 'score-number-compact' : 'score-number'} ${isLive ? 'text-fg' : 'text-fg-secondary'} ${homeScore !== null && awayScore !== null && homeScore > awayScore ? 'text-accent-text' : ''}`}>
                  {homeScore ?? '-'}
                </span>
                <span className="text-fg-faint font-medium text-sm">x</span>
                <span className={`${compact ? 'score-number-compact' : 'score-number'} ${isLive ? 'text-fg' : 'text-fg-secondary'} ${homeScore !== null && awayScore !== null && awayScore > homeScore ? 'text-accent-text' : ''}`}>
                  {awayScore ?? '-'}
                </span>
              </div>
            )}
          </div>

          {/* Time Fora */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className={`font-medium truncate text-right ${isLive ? 'text-fg' : 'text-fg-secondary'} ${compact ? 'text-xs' : 'text-sm'}`}>
              {awayTeam.shortName || awayTeam.name}
            </span>
            <div className={`rounded-full bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden ${compact ? 'w-7 h-7' : 'w-8 h-8'}`}>
              {awayTeam.logoUrl ? (
                <Image src={awayTeam.logoUrl} alt={awayTeam.name} width={28} height={28} className={`object-contain ${compact ? 'w-6 h-6' : 'w-7 h-7'}`} />
              ) : (
                <span className="text-[10px] font-bold text-fg-muted">
                  {(awayTeam.shortName || awayTeam.name).slice(0, 2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estadio */}
        {!compact && venue && (
          <div className="mt-3 text-[11px] text-fg-faint text-center truncate">
            {venue}
          </div>
        )}
      </div>

      {/* Popover de Gols */}
      {showGoals && hasGoals && (
        <MatchGoalsPopover goals={match.goals!} homeTeamId={homeTeam.id} awayTeamId={awayTeam.id} />
      )}
    </div>
  );
}

export function MatchCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`glass-card-sm animate-pulse ${compact ? 'py-3 px-4' : 'py-4 px-5'}`}>
      <div className="skeleton h-3 w-20 mb-3" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="skeleton h-6 w-12" />
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface RoundSectionProps {
  roundNumber: number;
  matches: Match[];
  loading?: boolean;
}

function MatchGoalsPopover({
  goals,
  homeTeamId,
  awayTeamId,
}: {
  goals: Goal[];
  homeTeamId: number;
  awayTeamId: number;
}) {
  const homeGoals = goals.filter((g) => g.teamId === homeTeamId);
  const awayGoals = goals.filter((g) => g.teamId === awayTeamId);

  return (
    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 px-4">
      <div className="bg-[var(--glass-strong-bg)] backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-border">
          <div className="flex-1 text-center py-1.5 text-[11px] font-medium text-fg-muted uppercase tracking-wider">
            Casa
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center py-1.5 text-[11px] font-medium text-fg-muted uppercase tracking-wider">
            Visitante
          </div>
        </div>
        <div className="flex divide-x divide-border">
          {/* Gols Casa */}
          <div className="flex-1 py-2 px-2.5 min-h-[2rem]">
            {homeGoals.length === 0 ? (
              <p className="text-[11px] text-fg-faint text-center italic">
                Sem gols
              </p>
            ) : (
              <ul className="space-y-1">
                {homeGoals.map((g, i) => (
                  <li key={i} className="text-xs text-fg-secondary flex items-center gap-1.5">
                    <span className="text-accent-text font-mono font-medium tabular-nums">{g.minute}&apos;</span>
                    <span className="truncate">{g.scorer}</span>
                    {g.isOwnGoal && (
                      <span className="text-yellow text-[10px] font-medium shrink-0">GC</span>
                    )}
                    {g.isPenalty && (
                      <span className="text-blue text-[10px] font-medium shrink-0">P</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Gols Fora */}
          <div className="flex-1 py-2 px-2.5 min-h-[2rem]">
            {awayGoals.length === 0 ? (
              <p className="text-[11px] text-fg-faint text-center italic">
                Sem gols
              </p>
            ) : (
              <ul className="space-y-1">
                {awayGoals.map((g, i) => (
                  <li key={i} className="text-xs text-fg-secondary flex items-center gap-1.5">
                    <span className="text-accent-text font-mono font-medium tabular-nums">{g.minute}&apos;</span>
                    <span className="truncate">{g.scorer}</span>
                    {g.isOwnGoal && (
                      <span className="text-yellow text-[10px] font-medium shrink-0">GC</span>
                    )}
                    {g.isPenalty && (
                      <span className="text-blue text-[10px] font-medium shrink-0">P</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoundSection({ roundNumber, matches, loading }: RoundSectionProps) {
  if (loading) {
    return (
      <GlassPanel title={`Rodada ${roundNumber}`}>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <MatchCardSkeleton key={i} compact />
          ))}
        </div>
      </GlassPanel>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <GlassPanel title={`Rodada ${roundNumber}`}>
        <p className="text-fg-muted text-sm text-center py-6">
          Nenhuma partida encontrada para esta rodada.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel title={`Rodada ${roundNumber}`}>
      <div className="space-y-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} compact />
        ))}
      </div>
    </GlassPanel>
  );
}
