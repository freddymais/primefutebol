'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-strong-border)',
              borderRadius: '12px',
              color: 'var(--fg)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00E676', secondary: 'var(--bg)' },
            },
            error: {
              iconTheme: { primary: '#FF5252', secondary: 'var(--bg)' },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
