import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:3000/api';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let backendResponse: Response;
    
    if (contentType.includes('application/json')) {
      // Handle URL submission
      const body = await request.json();
      console.log(`Calling backend: ${BACKEND_URL}/parse with body:`, body);
      
      backendResponse = await fetch(`${BACKEND_URL}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      // Handle PDF submission - forward the form data
      const formData = await request.formData();
      
      console.log(`Forwarding FormData to backend: ${BACKEND_URL}/parse`);
      
      backendResponse = await fetch(`${BACKEND_URL}/parse`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let fetch handle it automatically for FormData
      });
    }
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text().catch(() => '');
      console.error(`Backend returned ${backendResponse.status}: ${errorText}`);
      
      let errorMessage = 'Backend request failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || `Backend returned status ${backendResponse.status}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: backendResponse.status }
      );
    }
    
    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
