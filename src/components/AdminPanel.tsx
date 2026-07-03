'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const [visible, setVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [stats, setStats] = useState<{
    teams: number;
    matches: number;
    standings: number;
    scorers: number;
  } | null>(null);
  const queryClient = useQueryClient();

  const toggle = useCallback(() => {
    setVisible((v) => !v);
  }, []);

  useEffect(() => {
    (window as any).__toggleAdminPanel = toggle;
    return () => {
      delete (window as any).__toggleAdminPanel;
    };
  }, [toggle]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'ç' || e.key === 'Ç')) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const handleForceSync = async () => {
    setSyncing(true);
    const toastId = toast.loading('Forçando sync da API...');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Erro no sync');
      const data = await res.json();
      setLastSync(new Date());
      setStats(data.stats);
      toast.success(`✅ Sync forçado! ${data.message}`, { id: toastId, duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRounds'] });
      queryClient.invalidateQueries({ queryKey: ['scorers'] });
    } catch (err: any) {
      toast.error(err.message || 'Falha no sync', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const handleRefreshDb = async () => {
    const toastId = toast.loading('Atualizando do banco...');
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
      toast.success('✅ Dados atualizados do banco!', { id: toastId, duration: 3000 });
    } catch {
      toast.error('Erro ao atualizar', { id: toastId });
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#1a1d27]/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl min-w-[220px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Admin
          </span>
          <button
            onClick={toggle}
            className="text-white/30 hover:text-white/60 text-xs leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {syncing ? 'Sincronizando...' : '⚡ Forçar Sync API'}
          </button>

          <button
            onClick={handleRefreshDb}
            className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white/70 hover:bg-white/10 transition-all"
          >
            🔄 Atualizar do Banco
          </button>
        </div>

        {lastSync && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-0.5">
            <p className="text-[10px] text-white/30">
              Último sync: {lastSync.toLocaleTimeString('pt-BR')}
            </p>
            {stats && (
              <p className="text-[10px] text-white/20">
                {stats.teams} times · {stats.matches} partidas · {stats.scorers} artilheiros
              </p>
            )}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-[9px] text-white/20 leading-relaxed">
            Atalho: <kbd className="text-emerald-400/60">Ctrl+Shift+ç</kbd>
            <br />
            Console:{' '}
            <code className="text-emerald-400/60">__toggleAdminPanel()</code>
          </p>
        </div>
      </div>
    </div>
  );
}
