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
    // First try to get token price directly from the token endpoint
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${tokenAddress}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Token ${tokenAddress} API Response:`, JSON.stringify(data, null, 2));
      
      const price = data?.data?.attributes?.price_usd || 0;
      const symbol = data?.data?.attributes?.symbol || 'UNKNOWN';
      
      console.log(`Token ${tokenAddress} price: $${price}`);
      
      const tokenPrice: TokenPrice = {
        symbol,
        price,
        address: tokenAddress
      };
      
      return NextResponse.json(tokenPrice);
    }

    // If token endpoint fails, try to find a pool that contains this token
    // This is a fallback for tokens that might not have direct price data
    console.log(`Token ${tokenAddress} not found in direct endpoint, trying pool search...`);
    
    // For now, return 0 price if token is not found
    const tokenPrice: TokenPrice = {
      symbol: 'UNKNOWN',
      price: 0,
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