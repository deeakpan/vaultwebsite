import { NextRequest, NextResponse } from 'next/server';

interface TokenPrice {
  symbol: string;
  price: number;
  address: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenAddress = searchParams.get('address');

  if (!tokenAddress) {
    return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
  }

  try {
    // Fetch token price from GeckoTerminal API using the token contract address
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/${tokenAddress}`);
    
    if (!response.ok) {
      // Try alternative endpoint for tokens without pools
      const altResponse = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${tokenAddress}`);
      if (!altResponse.ok) {
        throw new Error(`Failed to fetch price for token ${tokenAddress}`);
      }
      const altData = await altResponse.json();
      const price = altData?.data?.attributes?.price_usd || 0;
      const symbol = altData?.data?.attributes?.symbol || 'UNKNOWN';
      
      console.log(`Token ${tokenAddress} price (alt): $${price}`);
      
      const tokenPrice: TokenPrice = {
        symbol,
        price,
        address: tokenAddress
      };
      
      return NextResponse.json(tokenPrice);
    }

    const data = await response.json();
    
    // Extract price from the response
    const price = data?.data?.attributes?.base_token_price_usd || 0;
    const symbol = data?.data?.attributes?.base_token_symbol || 'UNKNOWN';
    
    console.log(`Token ${tokenAddress} price: $${price}`);
    
    const tokenPrice: TokenPrice = {
      symbol,
      price,
      address: tokenAddress
    };

    return NextResponse.json(tokenPrice);
  } catch (error) {
    console.error('Error fetching token price:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch token price',
      symbol: 'UNKNOWN',
      price: 0,
      address: tokenAddress
    }, { status: 500 });
  }
} 