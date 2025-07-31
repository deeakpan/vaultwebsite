import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch PEPU price from the USDT/WPEPU pool on GeckoTerminal
    // Using the correct pool address: 0x4be3af53800aade09201654cd76d55063c7bde70
    const response = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/0x4be3af53800aade09201654cd76d55063c7bde70');
    
    if (!response.ok) {
      console.error(`GeckoTerminal API error: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch PEPU price from pool');
    }

    const data = await response.json();
    console.log('GeckoTerminal API Response:', JSON.stringify(data, null, 2));
    
    // Extract WPEPU price from the pool data
    // In USDT/WPEPU pool, WPEPU is the quote token
    const price = data?.data?.attributes?.quote_token_price_usd || 0;
    
    console.log(`PEPU Price from pool: $${price}`);
    
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