export interface Team {
  id: number;
  name: string;
  shortName: string | null;
  slug: string | null;
  logoUrl: string | null;
  stadium: string | null;
  externalId: string | null;
}

export interface Standing {
  id: number;
  seasonId: number;
  teamId: number;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  last5: string | null;
  updatedAt: string | null;
  team: Team;
}

export interface Match {
  id: number;
  roundId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  matchDatetime: string;
  venue: string | null;
  externalId: string | null;
  lastSyncedAt: string | null;
  round: { number: number };
  homeTeam: Team;
  awayTeam: Team;
  goals?: Goal[];
}

export interface Round {
  id: number;
  seasonId: number;
  number: number;
  isCurrent: boolean;
  matches: Match[];
}

export interface Season {
  id: number;
  year: number;
  competitionName: string;
}

export interface Goal {
  id: number;
  matchId: number;
  teamId: number;
  scorer: string;
  minute: number;
  isOwnGoal: boolean;
  isPenalty: boolean;
}

export interface TopScorerData {
  id: number;
  playerName: string;
  goals: number;
  assists: number | null;
  penalties: number | null;
  played: number;
  team: Team;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export type ZoneType = 'libertadores' | 'prelibertadores' | 'sulamericana' | 'none' | 'rebaixamento';

export function getZoneType(position: number): ZoneType {
  if (position <= 4) return 'libertadores';
  if (position <= 6) return 'prelibertadores';
  if (position <= 12) return 'sulamericana';
  if (position >= 17) return 'rebaixamento';
  return 'none';
}

export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  // Formatar para fuso de Brasília (UTC-3)
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatMatchTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMatchDateTime(dateStr: string): string {
  return `${formatMatchDate(dateStr)} • ${formatMatchTime(dateStr)}`;
}

export function getLiveMinutes(dateStr: string, status: MatchStatus): number | null {
  if (status !== 'live') return null;
  const matchDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - matchDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 0) return 0;
  if (diffMinutes > 120) return 90; // max 90 + acréscimos
  return Math.min(diffMinutes, 120);
}
