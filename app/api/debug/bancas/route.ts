import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      DATABASE_URL_length: process.env.DATABASE_URL?.length || 0
    },
    test: {}
  };

  try {
    // Tentar criar pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    debug.test.pool_created = true;

    // Tentar query simples
    const { rows } = await pool.query('SELECT NOW() as now');
    debug.test.query_success = true;
    debug.test.now = rows[0]?.now;

    // Tentar contar bancas
    const { rows: bancasRows } = await pool.query('SELECT COUNT(*)::int as count FROM bancas');
    debug.test.bancas_count = bancasRows[0]?.count;

    // Tentar listar 3 bancas
    const { rows: bancasList } = await pool.query('SELECT id, name, area FROM bancas LIMIT 3');
    debug.test.bancas_sample = bancasList;

    await pool.end();

    return NextResponse.json({ success: true, debug });
  } catch (error: any) {
    debug.error = {
      message: error.message,
      code: error.code,
      stack: error.stack
    };
    return NextResponse.json({ success: false, debug }, { status: 500 });
  }
}
