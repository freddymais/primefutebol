'use client';

import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  onClick?: () => void;
  as?: 'div' | 'button';
}

const colSpanMap: Record<number, string> = {
  1: '',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
};

const rowSpanMap: Record<number, string> = {
  1: '',
  2: 'lg:row-span-2',
};

export function BentoCard({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  onClick,
  as: Component = 'div',
}: BentoCardProps) {
  return (
    <Component
      onClick={onClick}
      className={`
        glass-card animate-fade-in
        ${colSpanMap[colSpan] || ''}
        ${rowSpanMap[rowSpan] || ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className = '', lines = 4 }: SkeletonCardProps) {
  return (
    <div className={`glass-card animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4 w-full"
            style={{ width: `${80 - i * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 text-3xl">⚠️</div>
      <p className="text-sm text-red-400/80 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-fg bg-surface hover:bg-surface-hover rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
