'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

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
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(11, 14, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#00E676', secondary: '#0B0E14' },
          },
          error: {
            iconTheme: { primary: '#FF5252', secondary: '#0B0E14' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
