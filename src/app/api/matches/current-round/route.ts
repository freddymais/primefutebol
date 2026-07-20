import { NextResponse } from 'next/server';
import { getCurrentRound } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentRound = await getCurrentRound();
    if (!currentRound) {
      return NextResponse.json({ round: null, matches: [] });
    }
    return NextResponse.json({
      round: { id: currentRound.id, number: currentRound.number },
      matches: currentRound.matches,
    });
  } catch (error: any) {
    console.error('[API] /api/matches/current-round error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar rodada atual.' },
      { status: 500 }
    );
  }
}
