import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Pool } from 'pg';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

// Conexão direta com banco (fallback se API não funcionar)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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
    
    // Consultar diretamente no banco
    let query = 'SELECT * FROM bancas WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (area && area !== 'all') {
      query += ` AND area = $${paramCount}`;
      params.push(area);
      paramCount++;
    }
    
    if (status === 'active') {
      query += ` AND is_active = true`;
    } else if (status === 'inactive') {
      query += ` AND is_active = false`;
    }
    
    // Ordenação
    if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'contests') {
      query += ' ORDER BY total_contests DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const { rows } = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database error:', error);
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

    const { rows: [banca] } = await pool.query(`
      INSERT INTO bancas (name, full_name, acronym, area, description, website, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [name, full_name, acronym, area, description, website, is_active !== false]);

    return NextResponse.json(banca, { status: 201 });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
