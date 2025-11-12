import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { API_CONFIG } from '@/lib/config';
import { Pool } from 'pg';

// Usar API ao invés de conexão direta
const API_URL = API_CONFIG.API_URL;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows: [stats] } = await pool.query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_active = true)::int AS active,
        COALESCE(SUM(total_contests), 0)::int AS total_contests
      FROM bancas
    `);

    return NextResponse.json(stats || { total: 0, active: 0, total_contests: 0 });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
