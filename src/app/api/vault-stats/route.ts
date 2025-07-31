import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const vaultAddress = '0x8746D6Fc80708775461226657a6947497764BBe6';
    const url = `https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${vaultAddress}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from GeckoTerminal' }, { status: 502 });
    }

    const data = await response.json();
    console.log('Full GeckoTerminal Response:', JSON.stringify(data, null, 2));
    
    const attr = data?.data?.attributes;

    return NextResponse.json({
      price: attr?.price_usd ? Number(attr.price_usd) : 0,
      fdv: attr?.fdv_usd ? Number(attr.fdv_usd) : 0,
      marketCap: attr?.market_cap_usd ? Number(attr.market_cap_usd) : 0,
      volume24h: attr?.volume_usd?.h24 ? Number(attr.volume_usd.h24) : 0,
      // Additional useful fields
      name: attr?.name || '',
      symbol: attr?.symbol || '',
      totalSupply: attr?.total_supply || '',
      normalizedTotalSupply: attr?.normalized_total_supply || '',
      totalReserveUSD: attr?.total_reserve_in_usd ? Number(attr.total_reserve_in_usd) : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 