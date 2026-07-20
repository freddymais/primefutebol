'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const COOLDOWN_SECONDS = 30;

export function SyncButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading('Atualizando dados do banco...');

    try {
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRounds'] });
      queryClient.invalidateQueries({ queryKey: ['scorers'] });

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['standings'] }),
        queryClient.refetchQueries({ queryKey: ['currentRound'] }),
        queryClient.refetchQueries({ queryKey: ['upcomingRounds'] }),
        queryClient.refetchQueries({ queryKey: ['scorers'] }),
      ]);

      toast.success('Dados atualizados do banco!', { id: toastId, duration: 3000 });
    } catch (error: any) {
      toast.error('Erro ao atualizar dados', { id: toastId });
    } finally {
      setIsRefreshing(false);
      startCooldown();
    }
  };

  const disabled = isRefreshing || cooldown > 0;

  return (
    <button
      onClick={handleRefresh}
      disabled={disabled}
      className={`
        relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
        ${disabled
          ? 'bg-accent-dim text-accent-text/50 cursor-not-allowed'
          : 'bg-accent-dim text-accent-text hover:bg-accent/25 hover:shadow-lg hover:shadow-accent/10 active:scale-95'
        }
      `}
    >
      {isRefreshing ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Atualizando...
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
          Atualizar Dados
        </>
      )}
    </button>
  );
}
