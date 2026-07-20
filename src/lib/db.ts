import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// ============================================
// Repositórios — camada de acesso a dados
// ============================================

import type { Standing, Match, Round, Team, TopScorerData } from './types';

/**
 * Busca a temporada mais recente
 */
export async function getCurrentSeason() {
  return prisma.season.findFirst({
    orderBy: { year: 'desc' },
  });
}

/**
 * Busca a rodada atual (filtrada pela temporada corrente)
 */
export async function getCurrentRound() {
  const season = await getCurrentSeason();
  if (!season) return null;

  return prisma.round.findFirst({
    where: { isCurrent: true, seasonId: season.id },
    include: {
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          round: true,
          goals: {
            orderBy: { minute: 'asc' },
          },
        },
        orderBy: { matchDatetime: 'asc' },
      },
    },
  });
}

/**
 * Busca a classificação completa
 */
export async function getStandings() {
  const season = await getCurrentSeason();
  if (!season) return [];

  const standings = await prisma.standing.findMany({
    where: { seasonId: season.id },
    include: { team: true },
    orderBy: { position: 'asc' },
  });

  return standings.map((s) => ({
    ...s,
    seasonId: s.seasonId,
    teamId: s.teamId,
    goalDifference: s.goalDifference,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    last5: s.last5,
    updatedAt: s.updatedAt,
  }));
}

/**
 * Busca jogos das próximas rodadas (a partir da rodada atual)
 */
export async function getUpcomingRounds(limit = 5) {
  const season = await getCurrentSeason();
  if (!season) return [];

  const currentRound = await prisma.round.findFirst({
    where: { isCurrent: true, seasonId: season.id },
  });

  const whereClause: any = {
    seasonId: season.id,
  };

  if (currentRound) {
    whereClause.number = { gte: currentRound.number };
  }

  const rounds = await prisma.round.findMany({
    where: whereClause,
    include: {
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          round: true,
          goals: {
            orderBy: { minute: 'asc' },
          },
        },
        orderBy: { matchDatetime: 'asc' },
      },
    },
    orderBy: { number: 'asc' },
    take: limit,
  });

  return rounds;
}

/**
 * Busca todas as rodadas de uma temporada
 */
export async function getAllRounds() {
  const season = await getCurrentSeason();
  if (!season) return [];

  return prisma.round.findMany({
    where: { seasonId: season.id },
    include: {
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          round: true,
          goals: {
            orderBy: { minute: 'asc' },
          },
        },
        orderBy: { matchDatetime: 'asc' },
      },
    },
    orderBy: { number: 'asc' },
  });
}

/**
 * Busca artilheiros do campeonato
 */
export async function getTopScorers(limit = 20): Promise<TopScorerData[]> {
  const season = await getCurrentSeason();
  if (!season) return [];

  const scorers = await prisma.topScorer.findMany({
    where: { seasonId: season.id },
    include: { team: true },
    orderBy: { goals: 'desc' },
    take: limit,
  });

  return scorers.map((s) => ({
    id: s.id,
    playerName: s.playerName,
    goals: s.goals,
    assists: s.assists,
    penalties: s.penalties,
    played: s.played,
    team: s.team,
  }));
}

/**
 * Busca todos os times
 */
export async function getAllTeams() {
  return prisma.team.findMany({ orderBy: { name: 'asc' } });
}
