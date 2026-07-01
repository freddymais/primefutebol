'use client';

import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function GlassPanel({ children, className = '', title, icon, action }: GlassPanelProps) {
  return (
    <div className={`glass-strong p-5 md:p-6 h-full flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          {title && (
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white/90">
              {icon && <span className="text-lg">{icon}</span>}
              {title}
            </h2>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
