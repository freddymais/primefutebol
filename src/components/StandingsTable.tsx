'use client';

import React from 'react';
import Image from 'next/image';
import type { Standing } from '@/lib/types';
import { getZoneType } from '@/lib/types';
import { FormBadge } from './ui/Badge';
import { SkeletonCard, ErrorCard } from './ui/BentoCard';

interface StandingsTableProps {
  standings: Standing[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const zoneColors: Record<string, { borderColor: string; background: string }> = {
  libertadores: { borderColor: '#34D399', background: 'linear-gradient(90deg, rgba(52, 211, 153, 0.06), transparent)' },
  prelibertadores: { borderColor: '#2DD4BF', background: 'linear-gradient(90deg, rgba(45, 212, 191, 0.05), transparent)' },
  sulamericana: { borderColor: '#60A5FA', background: 'linear-gradient(90deg, rgba(96, 165, 250, 0.04), transparent)' },
  rebaixamento: { borderColor: '#FB7185', background: 'linear-gradient(90deg, rgba(251, 113, 133, 0.06), transparent)' },
  none: { borderColor: 'transparent', background: 'transparent' },
};

export function StandingsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="skeleton h-6 w-6 rounded" />
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-4 flex-1" />
          <div className="skeleton h-4 w-6" />
          <div className="skeleton h-4 w-6" />
          <div className="skeleton h-4 w-6" />
          <div className="skeleton h-4 w-6" />
          <div className="skeleton h-4 w-8" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="skeleton h-5 w-5 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StandingsTable({ standings, loading, error, onRetry }: StandingsTableProps) {
  if (loading) return <StandingsTableSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={onRetry} />;
  if (!standings || standings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-fg-muted text-sm">
          Nenhum dado de classificacao disponivel.
        </p>
        <p className="text-fg-faint text-xs mt-1">
          Clique em &ldquo;Sincronizar&rdquo; para buscar os dados.
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-fg-muted uppercase tracking-wider border-b border-border">
            <th className="text-left py-3 px-2 font-medium w-8">#</th>
            <th className="text-left py-3 px-2 font-medium">Time</th>
            <th className="text-center py-3 px-1.5 font-medium w-9">PG</th>
            <th className="text-center py-3 px-1.5 font-medium w-6">J</th>
            <th className="text-center py-3 px-1.5 font-medium w-6">V</th>
            <th className="text-center py-3 px-1.5 font-medium w-6">E</th>
            <th className="text-center py-3 px-1.5 font-medium w-6">D</th>
            <th className="text-center py-3 px-1.5 font-medium w-7">GP</th>
            <th className="text-center py-3 px-1.5 font-medium w-7">GC</th>
            <th className="text-center py-3 px-1.5 font-medium w-8">SG</th>
            <th className="text-center py-3 px-1.5 font-medium hidden md:table-cell">Ultimos 5</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, idx) => {
            const zone = getZoneType(s.position);
            const color = zoneColors[zone];
            return (
              <tr
                key={s.teamId}
                style={{
                  borderLeft: `3px solid ${color.borderColor}`,
                  background: color.background,
                }}
                className={`group transition-all duration-200 hover:bg-surface ${
                  idx < standings.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <td className="py-3 px-2">
                  <span className="position-number text-xs text-fg-muted tabular-nums">
                    {s.position}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2.5">
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
                    <span className="font-medium text-fg-secondary text-sm truncate max-w-[140px]">
                      {s.team.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-1.5 text-center">
                  <span className="font-bold text-fg text-sm tabular-nums">{s.points}</span>
                </td>
                <td className="py-3 px-1.5 text-center text-fg-secondary text-xs tabular-nums">{s.played}</td>
                <td className="py-3 px-1.5 text-center text-fg-secondary text-xs tabular-nums">{s.wins}</td>
                <td className="py-3 px-1.5 text-center text-fg-secondary text-xs tabular-nums">{s.draws}</td>
                <td className="py-3 px-1.5 text-center text-fg-secondary text-xs tabular-nums">{s.losses}</td>
                <td className="py-3 px-1.5 text-center text-fg-secondary text-xs tabular-nums">{s.goalsFor}</td>
                <td className="py-3 px-1.5 text-center text-fg-secondary text-xs tabular-nums">{s.goalsAgainst}</td>
                <td className="py-3 px-1.5 text-center">
                  <span className={`text-xs font-medium tabular-nums ${
                    s.goalDifference > 0 ? 'text-accent-text' : s.goalDifference < 0 ? 'text-red-400' : 'text-fg-muted'
                  }`}>
                    {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
                  </span>
                </td>
                <td className="py-3 px-1.5 text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-0.5">
                    {s.last5?.split(',').map((result, i) => (
                      <FormBadge key={i} result={result.trim()} />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
