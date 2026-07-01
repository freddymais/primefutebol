import { NextResponse } from 'next/server';
import { getStandings } from '@/lib/db';

export async function GET() {
  try {
    const standings = await getStandings();
    return NextResponse.json(standings);
  } catch (error: any) {
    console.error('[API] /api/standings error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar classificação.' },
      { status: 500 }
    );
  }
}
