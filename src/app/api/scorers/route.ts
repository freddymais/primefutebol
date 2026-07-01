import { NextResponse } from 'next/server';
import { getTopScorers } from '@/lib/db';

export const revalidate = 60;

export async function GET() {
  try {
    const scorers = await getTopScorers(20);
    return NextResponse.json(scorers);
  } catch (error: any) {
    console.error('[API] /api/scorers error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar artilheiros.' },
      { status: 500 }
    );
  }
}
