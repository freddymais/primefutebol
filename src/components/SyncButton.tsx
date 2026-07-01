'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const COOLDOWN_SECONDS = 61;

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando dados...');

    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) {
        throw new Error('API de dados do futebol sobrecarregada. Favor tentar novamente');
      }
      const data = await res.json();
      toast.success(
        `✅ ${data.message || 'Sincronizado!'} (${data.stats?.teams || 0} times, ${data.stats?.matches || 0} partidas, ${data.stats?.scorers || 0} artilheiros)`,
        { id: toastId, duration: 4000 }
      );
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRounds'] });
      queryClient.invalidateQueries({ queryKey: ['scorers'] });
    } catch (error: any) {
      toast.error(error.message || 'Falha na sincronização', { id: toastId });
    } finally {
      setIsSyncing(false);
      startCooldown();
    }
  };

  const disabled = isSyncing || cooldown > 0;

  return (
    <button
      onClick={handleSync}
      disabled={disabled}
      className={`
        relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400
        ${disabled
          ? 'bg-emerald-500/10 text-emerald-400/50 cursor-not-allowed'
          : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95'
        }
      `}
    >
      {isSyncing ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Sincronizando...
        </>
      ) : cooldown > 0 ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Aguarde {cooldown}s
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Sincronizar Resultados
        </>
      )}
    </button>
  );
}
