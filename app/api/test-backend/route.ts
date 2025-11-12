import { NextResponse } from 'next/server';

export async function GET() {
  const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  try {
    // Testar conexão com backend
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      apiUrl: API_URL,
      backendStatus: response.status,
      backendData: data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      apiUrl: API_URL,
      error: error.message
    }, { status: 500 });
  }
}
