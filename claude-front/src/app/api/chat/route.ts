import { NextRequest } from 'next/server';

const BACKEND_URL = 'http://localhost:3006/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Proxying chat request to backend:', JSON.stringify(body, null, 2));
    
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend chat error ${response.status}:`, errorText);
      return new Response(
        JSON.stringify({ error: `Backend error: ${response.status}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Stream the SSE response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Chat proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to connect to backend' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
