import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: (session as any).user,
        hasToken: !!(session as any).token,
        tokenPreview: (session as any).token ? `${(session as any).token.substring(0, 20)}...` : null,
        role: (session as any).role
      } : null
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
