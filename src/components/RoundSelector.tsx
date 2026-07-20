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
      <div className="glass p-3 text-center text-fg-muted text-sm">
        Nenhuma rodada disponivel.
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
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
              ${isSelected
                ? 'bg-accent-dim text-accent-text border border-accent/30 shadow-lg shadow-accent/10'
                : round.isCurrent
                  ? 'bg-surface text-fg-secondary border border-border hover:bg-surface-hover'
                  : 'bg-surface text-fg-muted border border-transparent hover:bg-surface-hover hover:text-fg-secondary'
              }
            `}
          >
            <span>R{round.number}</span>
            {round.isCurrent && (
              <span className="w-1.5 h-1.5 bg-accent rounded-full inline-block animate-pulse flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
