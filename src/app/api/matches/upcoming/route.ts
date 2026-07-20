import { NextResponse } from 'next/server';
import { getAllRounds } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rounds = await getAllRounds();
    return NextResponse.json(rounds);
  } catch (error: any) {
    console.error('[API] /api/matches/upcoming error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar rodadas.' },
      { status: 500 }
    );
  }
}
