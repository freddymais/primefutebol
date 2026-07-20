'use client';

import React from 'react';
import Image from 'next/image';
import type { TopScorerData } from '@/lib/types';
import { SkeletonCard, ErrorCard } from './ui/BentoCard';

interface TopScorersTableProps {
  scorers: TopScorerData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TopScorersTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="skeleton h-6 w-6 rounded" />
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-4 flex-1" />
          <div className="skeleton h-4 w-6" />
          <div className="skeleton h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

export function TopScorersTable({ scorers, loading, error, onRetry }: TopScorersTableProps) {
  if (loading) return <TopScorersTableSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={onRetry} />;
  if (!scorers || scorers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-fg-muted text-sm">
          Nenhum artilheiro disponível.
        </p>
        <p className="text-fg-faint text-xs mt-1">
          Clique em &ldquo;Sincronizar&rdquo; para buscar os dados.
        </p>
      </div>
    );
  }

  const gold = scorers[0]?.goals ?? 0;

  return (
    <div className="space-y-1">
      {scorers.map((s, idx) => {
        const barWidth = gold > 0 ? Math.round((s.goals / gold) * 100) : 0;
        return (
          <div
            key={s.id}
            className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-surface"
          >
            <span className="w-5 text-center text-xs text-fg-muted tabular-nums">
              {idx + 1}º
            </span>
            <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden">
              {s.team.logoUrl ? (
                <Image
                  src={s.team.logoUrl}
                  alt={s.team.name}
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-[10px] font-bold text-fg-muted">
                  {(s.team.shortName || s.team.name).slice(0, 2)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-fg-secondary font-medium truncate">
                {s.playerName}
              </div>
              <div className="text-[11px] text-fg-faint truncate">
                {s.team.name}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-fg-muted tabular-nums">
                {s.played}J
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative h-5 w-10 rounded-full bg-surface overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-yellow-dim transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="font-bold text-sm text-fg tabular-nums w-5 text-right">
                  {s.goals}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
