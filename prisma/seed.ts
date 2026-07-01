import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (goals first due to FK)
  await prisma.goal.deleteMany();
  await prisma.match.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.round.deleteMany();
  await prisma.season.deleteMany();
  await prisma.team.deleteMany();

  // Create season
  const currentYear = new Date().getFullYear();
  const season = await prisma.season.create({
    data: {
      year: currentYear,
      competitionName: `Campeonato Brasileiro Série A ${currentYear}`,
    },
  });
  console.log(`✅ Season ${season.year} created`);

  // Teams
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
    const team = await prisma.team.create({ data: t });
    createdTeams.push(team);
  }
  console.log(`✅ ${createdTeams.length} teams created`);

  // Standings
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
    await prisma.standing.create({
      data: {
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
  }
  console.log(`✅ ${standingsMock.length} standings entries created`);

  // Rounds and matches
  const now = new Date();

  for (let roundNum = 1; roundNum <= 38; roundNum++) {
    const round = await prisma.round.create({
      data: {
        seasonId: season.id,
        number: roundNum,
        isCurrent: roundNum === 15,
      },
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

      await prisma.match.create({
        data: {
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
    }
  }
  console.log(`✅ 38 rounds with matches created`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
