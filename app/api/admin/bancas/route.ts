import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { API_CONFIG } from '@/lib/config';

const API_URL = API_CONFIG.API_URL;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (session as any).token;
    const { searchParams } = new URL(request.url);
    
    // Construir URL com query params
    const params = new URLSearchParams();
    if (searchParams.has('search')) params.set('search', searchParams.get('search')!);
    if (searchParams.has('area')) params.set('area', searchParams.get('area')!);
    if (searchParams.has('status')) params.set('status', searchParams.get('status')!);
    if (searchParams.has('sort')) params.set('sort', searchParams.get('sort')!);

    // Fazer proxy para a API backend
    const response = await fetch(`${API_URL}/admin/bancas?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
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

    const token = (session as any).token;
    const body = await request.json();

    // Fazer proxy para a API backend
    const response = await fetch(`${API_URL}/admin/bancas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
