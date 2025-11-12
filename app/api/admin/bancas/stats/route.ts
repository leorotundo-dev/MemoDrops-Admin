import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (session as any).token;

    const response = await fetch(`${API_URL}/admin/bancas/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `API error: ${error}` },
        { status: response.status }
      );
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
