import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch PEPU price from GeckoTerminal API
    // PEPU is the native token, so we need to get its price differently
    const response = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained');
    
    if (!response.ok) {
      throw new Error('Failed to fetch PEPU price');
    }

    const data = await response.json();
    
    // Extract PEPU price from network data
    const price = data?.data?.attributes?.native_token_price_usd || 0;
    
    return NextResponse.json({ 
      symbol: 'PEPU',
      price,
      address: 'native'
    });
  } catch (error) {
    console.error('Error fetching PEPU price:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch PEPU price',
      symbol: 'PEPU',
      price: 0,
      address: 'native'
    }, { status: 500 });
  }
} 