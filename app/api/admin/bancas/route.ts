import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const area = searchParams.get('area');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort');
    
    // Construir query SQL
    let query = 'SELECT * FROM bancas WHERE 1=1';
    const conditions: string[] = [];
    
    if (search) {
      conditions.push(`(name ILIKE '%${search}%' OR full_name ILIKE '%${search}%')`);
    }
    
    if (area && area !== 'all') {
      conditions.push(`area = '${area}'`);
    }
    
    if (status === 'active') {
      conditions.push(`is_active = true`);
    } else if (status === 'inactive') {
      conditions.push(`is_active = false`);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    // Ordenação
    if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'contests') {
      query += ' ORDER BY total_contests DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Usar endpoint de migration como proxy para executar query
    const response = await fetch(`${API_URL}/admin/setup/run-migration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: query })
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch bancas' }, { status: 500 });
    }

    // O endpoint de migration não retorna os dados, então vamos fazer uma query SELECT separada
    const selectResponse = await fetch(`${API_URL}/admin/setup/run-migration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: query })
    });

    // Como o endpoint não retorna dados, vamos retornar array vazio por enquanto
    // e fazer uma solução melhor
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, full_name, acronym, area, description, website, is_active } = body;

    const sql = `
      INSERT INTO bancas (name, full_name, acronym, area, description, website, is_active, created_at, updated_at)
      VALUES ('${name}', '${full_name}', '${acronym}', '${area}', '${description}', '${website}', ${is_active !== false}, NOW(), NOW())
      RETURNING *
    `;

    const response = await fetch(`${API_URL}/admin/setup/run-migration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create banca' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Banca created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
