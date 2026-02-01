import { NextRequest, NextResponse } from 'next/server';
import { parseReport } from '@/lib/report-parser';
import type { SendReportRequest } from '@/lib/contracts';

const BACKEND_URL = 'http://localhost:3000/api';

export async function POST(request: NextRequest) {
  try {
    const body: SendReportRequest = await request.json();
    const { report: markdownReport, email, url } = body;

    if (!markdownReport || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing report or email field' },
        { status: 400 }
      );
    }

    // Parse the markdown report into structured BSReport format
    const structuredReport = parseReport(markdownReport);

    // Forward to backend with structured data
    const backendResponse = await fetch(`${BACKEND_URL}/send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report: structuredReport,
        email,
        url,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text().catch(() => '');
      console.error(`Backend returned ${backendResponse.status}: ${errorText}`);
      
      let errorMessage = 'Failed to send email';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || `Backend returned status ${backendResponse.status}`;
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Send report API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
