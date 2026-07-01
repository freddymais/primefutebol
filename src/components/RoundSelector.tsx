'use client';

import React, { useRef, useEffect } from 'react';

interface RoundSelectorProps {
  rounds: { number: number; isCurrent: boolean }[];
  selectedRound: number;
  onSelectRound: (round: number) => void;
}

export function RoundSelector({ rounds, selectedRound, onSelectRound }: RoundSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && selectedRound > 0) {
      const selectedEl = containerRef.current.querySelector(`[data-round="${selectedRound}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedRound]);

  if (!rounds || rounds.length === 0) {
    return (
      <div className="glass p-3 text-center text-white/40 text-sm">
        Nenhuma rodada disponível.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-1.5 sm:gap-2"
    >
      {rounds.map((round) => {
        const isSelected = round.number === selectedRound;
        return (
          <button
            key={round.number}
            data-round={round.number}
            onClick={() => onSelectRound(round.number)}
            className={`
              flex items-center justify-center gap-1
              h-9 sm:h-10
              rounded-lg text-xs sm:text-sm font-medium
              transition-all duration-200
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400
              ${isSelected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : round.isCurrent
                  ? 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15'
                  : 'bg-white/[0.04] text-white/40 border border-transparent hover:bg-white/10 hover:text-white/60'
              }
            `}
          >
            <span>R{round.number}</span>
            {round.isCurrent && (
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
