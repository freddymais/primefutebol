'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'live' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
  pulsating?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface text-fg-secondary',
  live: 'bg-red-500/20 text-red-400',
  success: 'bg-accent-dim text-accent-text',
  warning: 'bg-yellow-dim text-yellow',
  error: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-dim text-blue',
};

export function Badge({ variant = 'default', children, className = '', pulsating = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${variantStyles[variant]}
        ${pulsating ? 'live-badge' : ''}
        ${className}
      `}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      )}
      {children}
    </span>
  );
}

interface FormBadgeProps {
  result: string;
}

const formColors: Record<string, string> = {
  V: 'bg-accent-dim text-accent-text',
  E: 'bg-yellow-dim text-yellow',
  D: 'bg-red-500/20 text-red-400',
};

const formLabels: Record<string, string> = {
  V: 'V',
  E: 'E',
  D: 'D',
};

export function FormBadge({ result }: FormBadgeProps) {
  const color = formColors[result] || 'bg-surface text-fg-muted';
  const label = formLabels[result] || result;

  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold leading-none ${color}`}
      title={result === 'V' ? 'Vitoria' : result === 'E' ? 'Empate' : 'Derrota'}
    >
      {label}
    </span>
  );
}
