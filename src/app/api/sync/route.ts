import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Tenta usar a API real se a chave estiver configurada
    if (process.env.FOOTBALL_API_KEY) {
      const { syncFootballData } = await import('@/lib/footballApiAdapter');
      const result = await syncFootballData();
      return NextResponse.json(result);
    }

    // Fallback para dados mockados
    const { syncMockData } = await import('@/lib/footballApiAdapter');
    const result = await syncMockData();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] /api/sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar dados.' },
      { status: 500 }
    );
  }
}
