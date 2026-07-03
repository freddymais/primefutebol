import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  console.time('[Cron/API] syncFootballData');

  try {
    if (!process.env.FOOTBALL_API_KEY) {
      return NextResponse.json(
        { error: 'FOOTBALL_API_KEY não configurada.' },
        { status: 400 }
      );
    }

    const { syncFootballData } = await import('@/lib/footballApiAdapter');
    const result = await syncFootballData();

    console.timeEnd('[Cron/API] syncFootballData');
    console.log(`[Cron/API] ${result.message}`);

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.timeEnd('[Cron/API] syncFootballData');
    console.error('[Cron/API] Sync error:', error);

    return NextResponse.json(
      { error: error.message || 'Erro na sincronização.' },
      { status: 500 }
    );
  }
}
