import prisma from './db';
import pLimit from 'p-limit';

const API_URL = process.env.FOOTBALL_API_URL || 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_API_KEY || '';
const COMPETITION_CODE = process.env.COMPETITION_CODE || 'BSA'; // BSA = Brasileirão Série A

// ============================================
// Interfaces para o formato Football-Data.org v4
// ============================================

interface FdTableEntry {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface FdStandingGroup {
  stage: string;
  type: string;
  group: string | null;
  table: FdTableEntry[];
}

interface FdStandingsResponse {
  competition: any;
  season: any;
  standings: FdStandingGroup[];
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    winner: string | null;
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
  venue: string | null;
}

interface FdGoalScorer {
  player: { name: string };
  team: { id: number; name: string };
  minute: number;
  type: string;
  scored?: boolean;
}

interface FdMatchesResponse {
  competition: any;
  matches: FdMatch[];
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
}

// ============================================
// Utilitários
// ============================================

/**
 * Mapeia status da Football-Data.org para o formato interno
 */
function mapStatus(fdStatus: string): string {
  const statusMap: Record<string, string> = {
    'SCHEDULED': 'scheduled',
    'TIMED': 'scheduled',
    'IN_PLAY': 'live',
    'PAUSED': 'live',
    'FINISHED': 'finished',
    'SUSPENDED': 'postponed',
    'POSTPONED': 'postponed',
    'CANCELLED': 'finished',
    'AWARDED': 'finished',
  };
  return statusMap[fdStatus] || 'scheduled';
}

/**
 * Converte form string no formato "W,W,D,W,L" para "V,E,D"
 */
function convertForm(fdForm: string | null): string | null {
  if (!fdForm) return null;
  const map: Record<string, string> = {
    'W': 'V',
    'D': 'E',
    'L': 'D',
  };
  return fdForm.split(',').map((r) => map[r.trim()] || r.trim()).join(',');
}

/**
 * Slugify: converte nome do time para slug
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extrai a temporada (ano) de uma data string da API
 * O Brasileirão começa em abril, então:
 * - Janeiro a março → temporada anterior
 * - Abril a dezembro → temporada atual
 */
function getSeasonYear(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  // Se estamos entre janeiro e março, a temporada começou no ano anterior
  if (month < 4) return now.getFullYear() - 1;
  return now.getFullYear();
}

/**
 * Busca dados da Football-Data.org com log de tempo
 */
async function fetchFromFdApi(endpoint: string, label: string): Promise<any> {
  const headers: Record<string, string> = {
    'X-Auth-Token': API_KEY,
  };

  const url = `${API_URL}${endpoint}`;
  console.log(`[FootballData.org] Fetching: ${url}`);

  console.time(`[API] ${label}`);
  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  console.timeEnd(`[API] ${label}`);

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(
      `API request failed: ${res.status} ${res.statusText}${errorBody ? ` — ${errorBody.slice(0, 200)}` : ''}`
    );
  }

  return res.json();
}

// ============================================
// Sincronização com a API real (Football-Data.org)
// ============================================

export async function syncFootballData(): Promise<{
  message: string;
  stats: { teams: number; matches: number; standings: number; scorers: number };
}> {
  const stats = { teams: 0, matches: 0, standings: 0, scorers: 0 };

  // 1. Determina temporada atual
  const year = getSeasonYear();
  let season = await prisma.season.findFirst({ where: { year } });
  if (!season) {
    season = await prisma.season.create({
      data: {
        year,
        competitionName: `Campeonato Brasileiro Série A ${year}`,
      },
    });
  }

  try {
    // 2. Limpa dados antigos desta temporada (evita duplicatas)
    console.log('[FootballData.org] Cleaning old data for season', year, '...');
    await prisma.goal.deleteMany({
      where: {
        match: {
          round: {
            seasonId: season.id,
          },
        },
      },
    });
    await prisma.match.deleteMany({
      where: { round: { seasonId: season.id } },
    });
    await prisma.round.deleteMany({
      where: { seasonId: season.id },
    });
    await prisma.standing.deleteMany({
      where: { seasonId: season.id },
    });

    // 3. Busca standings, matches e scorers em paralelo (máx 2 req simultâneas)
    console.log('[FootballData.org] Fetching API data in parallel...');
    const limit = pLimit(2);

    const [standingsData, matchesData, scorersData] = await Promise.all([
      limit(() => fetchFromFdApi(
        `/competitions/${COMPETITION_CODE}/standings`,
        'standings'
      )),
      limit(() => fetchFromFdApi(
        `/competitions/${COMPETITION_CODE}/matches`,
        'matches'
      )),
      limit(() => fetchFromFdApi(
        `/competitions/${COMPETITION_CODE}/scorers?limit=30`,
        'scorers'
      )),
    ]);

    console.log('[FootballData.org] All API data received. Processing...');

    // 4. Processa classificação (times + standings)
    console.log('[FootballData.org] Processing standings...');
    const totalStanding = (standingsData as FdStandingsResponse).standings?.find(
      (s) => s.type === 'TOTAL'
    );
    const tableEntries = totalStanding?.table || [];

    if (tableEntries.length === 0) {
      throw new Error('Nenhuma classificação encontrada para a competição.');
    }

    for (const entry of tableEntries) {
      const apiTeam = entry.team;

      const team = await prisma.team.upsert({
        where: { externalId: String(apiTeam.id) },
        update: {
          name: apiTeam.name,
          shortName: apiTeam.shortName || apiTeam.tla,
          slug: toSlug(apiTeam.name),
          logoUrl: apiTeam.crest,
        },
        create: {
          name: apiTeam.name,
          shortName: apiTeam.shortName || apiTeam.tla,
          slug: toSlug(apiTeam.name),
          logoUrl: apiTeam.crest,
          externalId: String(apiTeam.id),
        },
      });
      stats.teams++;

      await prisma.standing.upsert({
        where: {
          seasonId_teamId: {
            seasonId: season.id,
            teamId: team.id,
          },
        },
        update: {
          position: entry.position,
          played: entry.playedGames,
          wins: entry.won,
          draws: entry.draw,
          losses: entry.lost,
          goalsFor: entry.goalsFor,
          goalsAgainst: entry.goalsAgainst,
          goalDifference: entry.goalDifference,
          points: entry.points,
          last5: convertForm(entry.form),
          updatedAt: new Date().toISOString(),
        },
        create: {
          seasonId: season.id,
          teamId: team.id,
          position: entry.position,
          played: entry.playedGames,
          wins: entry.won,
          draws: entry.draw,
          losses: entry.lost,
          goalsFor: entry.goalsFor,
          goalsAgainst: entry.goalsAgainst,
          goalDifference: entry.goalDifference,
          points: entry.points,
          last5: convertForm(entry.form),
          updatedAt: new Date().toISOString(),
        },
      });
      stats.standings++;
    }

    // 5. Processa partidas
    console.log('[FootballData.org] Processing matches...');
    const matchEntries = (matchesData as FdMatchesResponse).matches || [];
    const roundMap = new Map<number, number>();

    let foundLive = false;
    let currentRoundSet = false;

    for (const fdMatch of matchEntries) {
      const roundNumber = fdMatch.matchday;

      const homeTeam = await findOrCreateTeam(fdMatch.homeTeam);
      const awayTeam = await findOrCreateTeam(fdMatch.awayTeam);

      if (!homeTeam || !awayTeam) continue;

      let roundId = roundMap.get(roundNumber);
      if (!roundId) {
        const round = await prisma.round.upsert({
          where: {
            seasonId_number: {
              seasonId: season.id,
              number: roundNumber,
            },
          },
          update: {},
          create: {
            seasonId: season.id,
            number: roundNumber,
            isCurrent: false,
          },
        });
        roundId = round.id;
        roundMap.set(roundNumber, roundId);
      }

      const isInPlay = fdMatch.status === 'IN_PLAY' || fdMatch.status === 'PAUSED';
      const isUpcoming = fdMatch.status === 'SCHEDULED' || fdMatch.status === 'TIMED';

      if (isInPlay && !foundLive) {
        foundLive = true;
        currentRoundSet = true;
        await prisma.round.updateMany({
          where: { seasonId: season.id },
          data: { isCurrent: false },
        });
        await prisma.round.update({
          where: { id: roundId },
          data: { isCurrent: true },
        });
      }

      if (isUpcoming && !currentRoundSet) {
        currentRoundSet = true;
        await prisma.round.updateMany({
          where: { seasonId: season.id },
          data: { isCurrent: false },
        });
        await prisma.round.update({
          where: { id: roundId },
          data: { isCurrent: true },
        });
      }

      const status = mapStatus(fdMatch.status);
      let homeScore: number | null = null;
      let awayScore: number | null = null;

      if (fdMatch.score?.fullTime) {
        homeScore = fdMatch.score.fullTime.home;
        awayScore = fdMatch.score.fullTime.away;
      }

      const matchRecord = await prisma.match.upsert({
        where: { externalId: String(fdMatch.id) },
        update: {
          homeScore,
          awayScore,
          status,
          matchDatetime: fdMatch.utcDate,
          venue: fdMatch.venue || homeTeam.stadium,
          lastSyncedAt: new Date().toISOString(),
        },
        create: {
          roundId,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore,
          awayScore,
          status,
          matchDatetime: fdMatch.utcDate,
          venue: fdMatch.venue || homeTeam.stadium,
          externalId: String(fdMatch.id),
          lastSyncedAt: new Date().toISOString(),
        },
      });
      stats.matches++;

      const goalDetails = (fdMatch as any).score?.details as FdGoalScorer[] | undefined;

      if (goalDetails && goalDetails.length > 0) {
        await prisma.goal.deleteMany({ where: { matchId: matchRecord.id } });

        for (const g of goalDetails) {
          if (g.type !== 'GOAL' && g.type !== 'PENALTY' && g.type !== 'OWN_GOAL') continue;
          const goalTeamId = g.team.id === fdMatch.homeTeam.id ? homeTeam.id : awayTeam.id;
          await prisma.goal.create({
            data: {
              matchId: matchRecord.id,
              teamId: goalTeamId,
              scorer: g.player.name,
              minute: g.minute,
              isOwnGoal: g.type === 'OWN_GOAL',
              isPenalty: g.type === 'PENALTY',
            },
          });
        }
      }
    }

    // 6. Gera last5 a partir dos resultados reais
    console.log('[FootballData.org] Generating last5 from match results...');
    for (const entry of tableEntries) {
      const apiTeam = entry.team;
      const team = await prisma.team.findFirst({
        where: { externalId: String(apiTeam.id) },
      });
      if (!team) continue;

      const lastMatches = await prisma.match.findMany({
        where: {
          OR: [
            { homeTeamId: team.id, status: 'finished' },
            { awayTeamId: team.id, status: 'finished' },
          ],
        },
        orderBy: { matchDatetime: 'desc' },
        take: 5,
      });

      if (lastMatches.length > 0) {
        const formParts = lastMatches.map((m) => {
          if (m.homeScore === null || m.awayScore === null) return null;
          if (m.homeTeamId === team.id) {
            if (m.homeScore > m.awayScore) return 'V';
            if (m.homeScore < m.awayScore) return 'D';
            return 'E';
          } else {
            if (m.awayScore > m.homeScore) return 'V';
            if (m.awayScore < m.homeScore) return 'D';
            return 'E';
          }
        }).filter((r): r is NonNullable<typeof r> => r !== null);

        if (formParts.length > 0) {
          await prisma.standing.update({
            where: {
              seasonId_teamId: {
                seasonId: season.id,
                teamId: team.id,
              },
            },
            data: {
              last5: formParts.join(','),
              updatedAt: new Date().toISOString(),
            },
          });
        }
      }
    }

    // 7. Processa artilheiros
    console.log('[FootballData.org] Processing top scorers...');
    const scorers = (scorersData as any).scorers || [];
    await prisma.topScorer.deleteMany({ where: { seasonId: season.id } });

    for (const s of scorers) {
      const team = await prisma.team.findFirst({
        where: { externalId: String(s.team.id) },
      });
      if (!team) continue;

      await prisma.topScorer.create({
        data: {
          seasonId: season.id,
          teamId: team.id,
          playerName: s.player.name,
          playerExternalId: String(s.player.id),
          goals: s.goals,
          assists: s.assists ?? null,
          penalties: s.penalties ?? null,
          played: s.playedMatches,
        },
      });
      stats.scorers++;
    }

    // 8. Garante que alguma rodada esteja marcada como atual
    if (!currentRoundSet) {
      const hasCurrentRound = await prisma.round.findFirst({
        where: { seasonId: season.id, isCurrent: true },
      });
      if (!hasCurrentRound) {
        const firstUpcoming = await prisma.match.findFirst({
          where: {
            status: { in: ['scheduled', 'live'] },
            round: { seasonId: season.id },
          },
          include: { round: true },
          orderBy: { matchDatetime: 'asc' },
        });
        if (firstUpcoming?.round) {
          await prisma.round.update({
            where: { id: firstUpcoming.round.id },
            data: { isCurrent: true },
          });
        } else {
          const lastRound = await prisma.round.findFirst({
            where: { seasonId: season.id },
            orderBy: { number: 'desc' },
          });
          if (lastRound) {
            await prisma.round.update({
              where: { id: lastRound.id },
              data: { isCurrent: true },
            });
          }
        }
      }
    }

    return {
      message: `Sincronização concluída! Dados do Brasileirão Série A ${year} atualizados via Football-Data.org.`,
      stats,
    };
  } catch (error: any) {
    console.error('[FootballData.org] Sync error:', error);
    throw new Error(`Falha na sincronização: ${error.message}`);
  }
}

/**
 * Busca um time por externalId ou cria a partir dos dados da API
 */
async function findOrCreateTeam(apiTeam: {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}): Promise<{ id: number; stadium: string | null } | null> {
  if (!apiTeam?.id) return null;

  let team = await prisma.team.findFirst({
    where: { externalId: String(apiTeam.id) },
  });

  if (!team) {
    team = await prisma.team.create({
      data: {
        name: apiTeam.name,
        shortName: apiTeam.shortName || apiTeam.tla || null,
        slug: toSlug(apiTeam.name),
        logoUrl: apiTeam.crest || null,
        externalId: String(apiTeam.id),
      },
    });
  } else {
    // Atualiza nome e logo caso tenham mudado
    team = await prisma.team.update({
      where: { id: team.id },
      data: {
        name: apiTeam.name,
        shortName: apiTeam.shortName || apiTeam.tla || team.shortName,
        logoUrl: apiTeam.crest || team.logoUrl,
      },
    });
  }

  return { id: team.id, stadium: team.stadium };
}

// ============================================
// Sincronização de artilheiros (Top Scorers)
// ============================================

export async function syncTopScorers(): Promise<number> {
  const year = getSeasonYear();
  const season = await prisma.season.findFirst({ where: { year } });
  if (!season) return 0;

  const data = await fetchFromFdApi(
    `/competitions/${COMPETITION_CODE}/scorers?limit=30`,
    'scorers'
  );
  const scorers: any[] = data.scorers || [];

  // Limpa artilheiros antigos da temporada
  await prisma.topScorer.deleteMany({ where: { seasonId: season.id } });

  let count = 0;
  for (const s of scorers) {
    const team = await prisma.team.findFirst({
      where: { externalId: String(s.team.id) },
    });
    if (!team) continue;

    await prisma.topScorer.create({
      data: {
        seasonId: season.id,
        teamId: team.id,
        playerName: s.player.name,
        playerExternalId: String(s.player.id),
        goals: s.goals,
        assists: s.assists ?? null,
        penalties: s.penalties ?? null,
        played: s.playedMatches,
      },
    });
    count++;
  }

  console.log(`[FootballData.org] Synced ${count} top scorers`);
  return count;
}

// ============================================
// Sincronização com dados mockados (fallback)
// ============================================

export async function syncMockData(): Promise<{
  message: string;
  stats: { teams: number; matches: number; standings: number };
}> {
  const year = getSeasonYear();
  const stats = { teams: 0, matches: 0, standings: 0 };

  let season = await prisma.season.findFirst({ where: { year } });
  if (!season) {
    season = await prisma.season.create({
      data: { year, competitionName: 'Campeonato Brasileiro Série A' },
    });
  }

  // Limpa dados antigos da temporada (evita duplicatas ao re-seedar)
  // Deleta gols primeiro para evitar violação de foreign key
  await prisma.goal.deleteMany({
    where: {
      match: {
        round: {
          seasonId: season.id,
        },
      },
    },
  });
  await prisma.match.deleteMany({
    where: { round: { seasonId: season.id } },
  });
  await prisma.round.deleteMany({
    where: { seasonId: season.id },
  });
  await prisma.standing.deleteMany({
    where: { seasonId: season.id },
  });

  // Times do Brasileirão (mock — sem logoUrl para evitar 404, componentes mostram iniciais)
  const teamsData = [
    { name: 'Flamengo', shortName: 'FLA', slug: 'flamengo', stadium: 'Maracanã' },
    { name: 'Palmeiras', shortName: 'PAL', slug: 'palmeiras', stadium: 'Allianz Parque' },
    { name: 'Botafogo', shortName: 'BOT', slug: 'botafogo', stadium: 'Nilton Santos' },
    { name: 'São Paulo', shortName: 'SAO', slug: 'sao-paulo', stadium: 'Morumbi' },
    { name: 'Internacional', shortName: 'INT', slug: 'internacional', stadium: 'Beira-Rio' },
    { name: 'Fortaleza', shortName: 'FOR', slug: 'fortaleza', stadium: 'Castelão' },
    { name: 'Cruzeiro', shortName: 'CRU', slug: 'cruzeiro', stadium: 'Mineirão' },
    { name: 'Atlético-MG', shortName: 'CAM', slug: 'atletico-mg', stadium: 'Arena MRV' },
    { name: 'Grêmio', shortName: 'GRE', slug: 'gremio', stadium: 'Arena do Grêmio' },
    { name: 'Santos', shortName: 'SAN', slug: 'santos', stadium: 'Vila Belmiro' },
    { name: 'Corinthians', shortName: 'COR', slug: 'corinthians', stadium: 'Neo Química Arena' },
    { name: 'Bahia', shortName: 'BAH', slug: 'bahia', stadium: 'Arena Fonte Nova' },
    { name: 'Fluminense', shortName: 'FLU', slug: 'fluminense', stadium: 'Maracanã' },
    { name: 'Vasco da Gama', shortName: 'VAS', slug: 'vasco', stadium: 'São Januário' },
    { name: 'Athletico-PR', shortName: 'CAP', slug: 'athletico-pr', stadium: 'Ligga Arena' },
    { name: 'Ceará', shortName: 'CEA', slug: 'ceara', stadium: 'Castelão' },
    { name: 'Sport Recife', shortName: 'SPO', slug: 'sport', stadium: 'Ilha do Retiro' },
    { name: 'Juventude', shortName: 'JUV', slug: 'juventude', stadium: 'Alfredo Jaconi' },
    { name: 'Mirassol', shortName: 'MIR', slug: 'mirassol', stadium: 'José Maria de Campos Maia' },
    { name: 'Red Bull Bragantino', shortName: 'RBB', slug: 'bragantino', stadium: 'Nabi Abi Chedid' },
  ];

  const createdTeams: any[] = [];
  for (const t of teamsData) {
    const team = await prisma.team.upsert({
      where: { slug: t.slug },
      update: { name: t.name, shortName: t.shortName, stadium: t.stadium },
      create: t,
    });
    createdTeams.push(team);
    stats.teams++;
  }

  // Classificação mock
  const standingsMock = [
    { pos: 1, pts: 65, p: 30, w: 19, d: 8, l: 3, gf: 52, ga: 22, form: 'V,V,E,V,D' },
    { pos: 2, pts: 62, p: 30, w: 18, d: 8, l: 4, gf: 48, ga: 18, form: 'V,V,V,E,E' },
    { pos: 3, pts: 59, p: 30, w: 17, d: 8, l: 5, gf: 45, ga: 21, form: 'V,D,V,E,V' },
    { pos: 4, pts: 56, p: 30, w: 16, d: 8, l: 6, gf: 42, ga: 24, form: 'E,V,V,E,V' },
    { pos: 5, pts: 52, p: 30, w: 15, d: 7, l: 8, gf: 40, ga: 28, form: 'V,E,V,D,V' },
    { pos: 6, pts: 50, p: 30, w: 14, d: 8, l: 8, gf: 38, ga: 27, form: 'D,V,E,V,V' },
    { pos: 7, pts: 47, p: 30, w: 13, d: 8, l: 9, gf: 36, ga: 30, form: 'V,E,D,V,E' },
    { pos: 8, pts: 45, p: 30, w: 12, d: 9, l: 9, gf: 34, ga: 31, form: 'E,V,V,D,E' },
    { pos: 9, pts: 43, p: 30, w: 12, d: 7, l: 11, gf: 33, ga: 33, form: 'D,V,E,D,V' },
    { pos: 10, pts: 41, p: 30, w: 11, d: 8, l: 11, gf: 31, ga: 32, form: 'V,D,D,V,E' },
    { pos: 11, pts: 39, p: 30, w: 10, d: 9, l: 11, gf: 29, ga: 34, form: 'D,V,E,V,D' },
    { pos: 12, pts: 38, p: 30, w: 10, d: 8, l: 12, gf: 28, ga: 35, form: 'V,E,D,D,V' },
    { pos: 13, pts: 36, p: 30, w: 9, d: 9, l: 12, gf: 27, ga: 37, form: 'E,V,D,V,D' },
    { pos: 14, pts: 35, p: 30, w: 9, d: 8, l: 13, gf: 26, ga: 38, form: 'D,E,V,D,V' },
    { pos: 15, pts: 33, p: 30, w: 8, d: 9, l: 13, gf: 25, ga: 39, form: 'V,D,E,D,E' },
    { pos: 16, pts: 32, p: 30, w: 8, d: 8, l: 14, gf: 24, ga: 40, form: 'D,V,D,E,V' },
    { pos: 17, pts: 29, p: 30, w: 7, d: 8, l: 15, gf: 22, ga: 42, form: 'D,D,V,E,D' },
    { pos: 18, pts: 27, p: 30, w: 6, d: 9, l: 15, gf: 21, ga: 44, form: 'V,D,D,E,D' },
    { pos: 19, pts: 24, p: 30, w: 5, d: 9, l: 16, gf: 19, ga: 46, form: 'D,E,D,D,V' },
    { pos: 20, pts: 21, p: 30, w: 4, d: 9, l: 17, gf: 17, ga: 48, form: 'E,D,D,V,D' },
  ];

  for (let i = 0; i < createdTeams.length; i++) {
    const s = standingsMock[i];
    await prisma.standing.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId: createdTeams[i].id } },
      update: {
        position: s.pos,
        played: s.p,
        wins: s.w,
        draws: s.d,
        losses: s.l,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        goalDifference: s.gf - s.ga,
        points: s.pts,
        last5: s.form,
        updatedAt: new Date().toISOString(),
      },
      create: {
        seasonId: season.id,
        teamId: createdTeams[i].id,
        position: s.pos,
        played: s.p,
        wins: s.w,
        draws: s.d,
        losses: s.l,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        goalDifference: s.gf - s.ga,
        points: s.pts,
        last5: s.form,
        updatedAt: new Date().toISOString(),
      },
    });
    stats.standings++;
  }

  // Rodadas e partidas mock
  const now = new Date();
  for (let roundNum = 1; roundNum <= 38; roundNum++) {
    const round = await prisma.round.upsert({
      where: { seasonId_number: { seasonId: season.id, number: roundNum } },
      update: {},
      create: { seasonId: season.id, number: roundNum, isCurrent: roundNum === 15 },
    });

    for (let matchIdx = 0; matchIdx < 10; matchIdx++) {
      const homeIdx = (roundNum * 10 + matchIdx * 2) % 20;
      const awayIdx = (roundNum * 10 + matchIdx * 2 + 1) % 20;

      if (homeIdx === awayIdx) continue;

      const matchDate = new Date(now);
      matchDate.setDate(matchDate.getDate() + (roundNum - 15) * 7 + matchIdx);

      let status: string;
      let homeScore: number | null = null;
      let awayScore: number | null = null;

      if (roundNum < 15) {
        status = 'finished';
        homeScore = Math.floor(Math.random() * 4);
        awayScore = Math.floor(Math.random() * 3);
      } else if (roundNum === 15) {
        if (matchIdx < 4) {
          status = 'finished';
          homeScore = Math.floor(Math.random() * 4);
          awayScore = Math.floor(Math.random() * 3);
        } else if (matchIdx < 6) {
          status = 'live';
          homeScore = Math.floor(Math.random() * 3);
          awayScore = Math.floor(Math.random() * 2);
        } else {
          status = 'scheduled';
        }
      } else {
        status = 'scheduled';
      }

      const matchRecord = await prisma.match.upsert({
        where: { externalId: `${roundNum}-${matchIdx}` },
        update: { homeScore, awayScore, status },
        create: {
          roundId: round.id,
          homeTeamId: createdTeams[homeIdx].id,
          awayTeamId: createdTeams[awayIdx].id,
          homeScore,
          awayScore,
          status,
          matchDatetime: matchDate.toISOString(),
          venue: createdTeams[homeIdx].stadium,
          externalId: `${roundNum}-${matchIdx}`,
          lastSyncedAt: new Date().toISOString(),
        },
      });
      stats.matches++;
    }
  }

  return {
    message: 'Dados mockados carregados com sucesso!',
    stats,
  };
}
