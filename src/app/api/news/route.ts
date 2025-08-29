import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.NEWS_ENDPOINT) {
      throw new Error('NEWS_ENDPOINT environment variable is not set');
    }
    
    const response = await fetch(process.env.NEWS_ENDPOINT, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news from Railway');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch news',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 