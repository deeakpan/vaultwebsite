import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('🚀 VaultGPT comprehensive analysis:', message);

    // Analyze user intent with natural language processing
    const userIntent = await analyzeUserIntent(message);
    console.log('🧠 User intent:', userIntent);

    // Gather ALL available data based on intent
    const comprehensiveData = await gatherAllMarketData(userIntent);
    console.log('📊 Data sources loaded:', Object.keys(comprehensiveData));

    // Generate intelligent response using all data
    const response = await generateIntelligentResponse(message, userIntent, comprehensiveData);

    return NextResponse.json({ 
      response,
      intent: userIntent,
      dataSources: Object.keys(comprehensiveData),
      comprehensiveData
    });

  } catch (error) {
    console.error('❌ VaultGPT Comprehensive Error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        response: "I'm having trouble accessing comprehensive market data. Please try again."
      }, 
      { status: 500 }
    );
  }
}

async function analyzeUserIntent(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an advanced intent analyzer for cryptocurrency market analysis. Extract:

TOKENS MENTIONED: Find all token names, symbols, or contract addresses
ANALYSIS TYPE: What kind of analysis is requested
COMPARISON TYPE: Are they comparing tokens or asking for rankings
TIME CONTEXT: What timeframe are they interested in
SPECIFIC METRICS: What data points do they want

Return JSON with:
{
  "tokens": ["token1", "token2"] or [],
  "analysisType": "price|performance|comparison|trending|new_launches|holders|trading|ecosystem|general",
  "comparisonType": "vs_market|vs_token|top_performers|gainers_losers|rankings|none",
  "timeframe": "1h|6h|24h|7d|30d|all_time|recent",
  "specificMetrics": ["price", "volume", "market_cap", "holders", "liquidity", "trades"],
  "contextualQuery": "brief description of what they want",
  "needsMarketContext": boolean,
  "needsEcosystemData": boolean,
  "priority": "urgent|high|medium|low"
}`
      },
      {
        role: "user",
        content: message
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

async function gatherAllMarketData(intent: any) {
  console.log('📡 Gathering comprehensive market data...');
  
  const dataPromises = [];
  
  // Always get PEPU data (your proven method)
  dataPromises.push(
    getPEPUComprehensiveData().then(data => ({ pepuData: data }))
  );
  
  // Get presale ecosystem data
  dataPromises.push(
    getPresaleEcosystemData().then(data => ({ presaleData: data }))
  );
  
  // Get trending and market context
  dataPromises.push(
    getTrendingMarketData().then(data => ({ trendingData: data }))
  );
  
  // Get gainers/losers if comparison requested
  if (intent.comparisonType?.includes('gainers') || intent.analysisType === 'performance') {
    dataPromises.push(
      getGainersLosersData().then(data => ({ gainersLosersData: data }))
    );
  }
  
  // Get new launches if relevant
  if (intent.analysisType === 'new_launches' || intent.needsEcosystemData) {
    dataPromises.push(
      getNewLaunchesData().then(data => ({ newLaunchesData: data }))
    );
  }
  
  // Get specific token data if tokens mentioned
  if (intent.tokens && intent.tokens.length > 0) {
    dataPromises.push(
      getSpecificTokensData(intent.tokens).then(data => ({ specificTokensData: data }))
    );
  }
  
  // Get broader market context
  if (intent.needsMarketContext) {
    dataPromises.push(
      getBroaderMarketContext().then(data => ({ marketContextData: data }))
    );
  }
  
  // Get advanced trading data
  if (intent.specificMetrics.includes('trades') || intent.analysisType === 'trading') {
    dataPromises.push(
      getAdvancedTradingData(intent.tokens).then(data => ({ tradingData: data }))
    );
  }
  
  const results = await Promise.all(dataPromises);
  return results.reduce((acc, result) => ({ ...acc, ...result }), {});
}

async function getPEPUComprehensiveData() {
  try {
    console.log('💎 Getting comprehensive PEPU data...');
    
    const response = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/0x4be3af53800aade09201654cd76d55063c7bde70');
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const attrs = data?.data?.attributes || {};
    
    // Get additional PEPU pool data
    const poolInfoResponse = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/0x4be3af53800aade09201654cd76d55063c7bde70/info`);
    const poolInfo = poolInfoResponse.ok ? await poolInfoResponse.json() : null;
    
    // Get OHLCV data for trend analysis
    const ohlcvResponse = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools/0x4be3af53800aade09201654cd76d55063c7bde70/ohlcv/day`);
    const ohlcvData = ohlcvResponse.ok ? await ohlcvResponse.json() : null;
    
    return {
      symbol: 'PEPU',
      name: 'Pepe Unchained',
      price: attrs.quote_token_price_usd || 0,
      market_cap: attrs.fdv_usd || 0,
      volume_24h: attrs.volume_usd?.h24 || 0,
      volume_7d: attrs.volume_usd?.h168 || 0,
      price_changes: attrs.price_change_percentage || {},
      liquidity: attrs.reserve_in_usd || 0,
      transactions: attrs.transactions || {},
      pool_created_at: attrs.pool_created_at,
      pool_info: poolInfo?.data?.attributes || null,
      ohlcv_data: ohlcvData?.data?.attributes?.ohlcv_list || null,
      network: 'pepe-unchained',
      pool_address: '0x4be3af53800aade09201654cd76d55063c7bde70'
    };
  } catch (error) {
    console.error('PEPU comprehensive data error:', error);
    return null;
  }
}

async function getPresaleEcosystemData() {
  try {
    console.log('🚀 Getting presale ecosystem data...');
    
    const query = `
      query EcosystemQuery {
        presales {
          blockNumber
          blockTimestamp
          data
          id
          isEnd
          minter
          name
          pairAddress
          paymentToken
          presaleAmount
          raisedAmount
          saleAmount
          symbol
          token
          totalSupply
          transactionHash
        }
      }
    `;

    const response = await fetch('https://pepu-mainnet2-pumppad.0sum.io/subgraphs/name/launchpad/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    const presales = data.data?.presales || [];
    
    // Analyze presale data
    const activePresales = presales.filter((p: any) => !p.isEnd);
    const completedPresales = presales.filter((p: any) => p.isEnd);
    const recentLaunches = presales
      .filter((p: any) => p.blockTimestamp)
      .sort((a: any, b: any) => b.blockTimestamp - a.blockTimestamp)
      .slice(0, 10);
    
    // Calculate ecosystem metrics
    const totalRaised = presales.reduce((sum: number, p: any) => sum + (parseFloat(p.raisedAmount) || 0), 0);
    const avgRaised = presales.length > 0 ? totalRaised / presales.length : 0;
    
    return {
      total_presales: presales.length,
      active_presales: activePresales.length,
      completed_presales: completedPresales.length,
      recent_launches: recentLaunches,
      total_raised: totalRaised,
      average_raise: avgRaised,
      ecosystem_activity: activePresales.length > 5 ? 'high' : activePresales.length > 2 ? 'medium' : 'low',
      latest_launches: recentLaunches.slice(0, 5)
    };
  } catch (error) {
    console.error('Presale ecosystem data error:', error);
    return null;
  }
}

async function getTrendingMarketData() {
  try {
    console.log('📈 Getting trending market data...');
    
    // Get trending pools on Pepe Unchained
    const trendingResponse = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained/trending_pools');
    const trendingData = trendingResponse.ok ? await trendingResponse.json() : null;
    
    // Get new pools
    const newPoolsResponse = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained/new_pools');
    const newPoolsData = newPoolsResponse.ok ? await newPoolsResponse.json() : null;
    
    // Get top pools by volume
    const topPoolsResponse = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools?page=1');
    const topPoolsData = topPoolsResponse.ok ? await topPoolsResponse.json() : null;
    
    return {
      trending_pools: trendingData?.data || [],
      new_pools: newPoolsData?.data || [],
      top_pools: topPoolsData?.data || [],
      market_activity: (trendingData?.data?.length || 0) > 5 ? 'high' : 'moderate',
      network_growth: (newPoolsData?.data?.length || 0) > 10 ? 'rapid' : 'steady'
    };
  } catch (error) {
    console.error('Trending market data error:', error);
    return null;
  }
}

async function getGainersLosersData() {
  try {
    console.log('📊 Getting gainers/losers data...');
    
    // Get CoinGecko gainers/losers for broader market context
    const gainersLosersResponse = await fetch('https://api.coingecko.com/api/v3/coins/top_gainers_losers?vs_currency=usd&duration=24h', {
      headers: { 'Accept': 'application/json' }
    });
    
    const gainersLosersData = gainersLosersResponse.ok ? await gainersLosersResponse.json() : null;
    
    // Get Pepe Unchained specific performance data
    const pepuPoolsResponse = await fetch('https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools?page=1');
    const pepuPools = pepuPoolsResponse.ok ? await pepuPoolsResponse.json() : null;
    
    // Analyze Pepe Unchained performance
    const pepuGainers: any[] = [];
    const pepuLosers: any[] = [];
    
    if (pepuPools?.data) {
      pepuPools.data.forEach((pool: any) => {
        const change24h = pool.attributes?.price_change_percentage?.h24 || 0;
        const poolData = {
          name: pool.attributes?.name || 'Unknown',
          symbol: pool.attributes?.base_token?.symbol || 'Unknown',
          price_change_24h: change24h,
          volume_24h: pool.attributes?.volume_usd?.h24 || 0,
          address: pool.attributes?.base_token?.address
        };
        
        if (change24h > 5) {
          pepuGainers.push(poolData);
        } else if (change24h < -5) {
          pepuLosers.push(poolData);
        }
      });
    }
    
    return {
      global_gainers: gainersLosersData?.top_gainers || [],
      global_losers: gainersLosersData?.top_losers || [],
      pepu_gainers: pepuGainers.sort((a, b) => b.price_change_24h - a.price_change_24h).slice(0, 10),
      pepu_losers: pepuLosers.sort((a, b) => a.price_change_24h - b.price_change_24h).slice(0, 10),
      market_sentiment: pepuGainers.length > pepuLosers.length ? 'bullish' : 'bearish'
    };
  } catch (error) {
    console.error('Gainers/losers data error:', error);
    return null;
  }
}

async function getNewLaunchesData() {
  try {
    console.log('🆕 Getting new launches data...');
    
    // Get CoinGecko new listings
    const newListingsResponse = await fetch('https://api.coingecko.com/api/v3/coins/list/new', {
      headers: { 'Accept': 'application/json' }
    });
    
    const newListings = newListingsResponse.ok ? await newListingsResponse.json() : null;
    
    return {
      global_new_listings: newListings || [],
      recent_count: newListings?.length || 0,
      launch_activity: (newListings?.length || 0) > 50 ? 'high' : 'moderate'
    };
  } catch (error) {
    console.error('New launches data error:', error);
    return null;
  }
}

async function getSpecificTokensData(tokens: string[]) {
  try {
    console.log('🎯 Getting specific tokens data:', tokens);
    
    const tokenResults = [];
    
    for (const token of tokens.slice(0, 5)) { // Limit to 5 tokens
      if (token.startsWith('0x') && token.length === 42) {
        // Contract address
        const tokenData = await getTokenByAddress(token);
        if (tokenData) tokenResults.push(tokenData);
      } else {
        // Search by name/symbol
        const tokenData = await searchTokenComprehensive(token);
        if (tokenData) tokenResults.push(tokenData);
      }
    }
    
    return tokenResults;
  } catch (error) {
    console.error('Specific tokens data error:', error);
    return [];
  }
}

async function getTokenByAddress(address: string) {
  try {
    // Try Pepe Unchained first
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${address}`);
    
    if (response.ok) {
      const data = await response.json();
      const attrs = data?.data?.attributes || {};
      
      // Get additional data
      const poolsResponse = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${address}/pools`);
      const poolsData = poolsResponse.ok ? await poolsResponse.json() : null;
      
      return {
        symbol: attrs.symbol || 'UNKNOWN',
        name: attrs.name || 'Unknown',
        address: address,
        price: attrs.price_usd || 0,
        network: 'pepe-unchained',
        pools: poolsData?.data || [],
        source: 'direct_lookup'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token by address error:', error);
    return null;
  }
}

async function searchTokenComprehensive(query: string) {
  try {
    // Search Pepe Unchained pools
    const searchResponse = await fetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${encodeURIComponent(query)}&network=pepe-unchained`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const pools = searchData.data || [];
      
      for (const pool of pools.slice(0, 3)) {
        const baseToken = pool.attributes?.base_token;
        const quoteToken = pool.attributes?.quote_token;
        
        if (baseToken && matchesToken(baseToken, query)) {
          return formatComprehensiveTokenData(pool, baseToken, 'base');
        }
        
        if (quoteToken && matchesToken(quoteToken, query)) {
          return formatComprehensiveTokenData(pool, quoteToken, 'quote');
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Comprehensive token search error:', error);
    return null;
  }
}

function matchesToken(token: any, query: string): boolean {
  if (!token) return false;
  
  const q = query.toLowerCase();
  const symbol = token.symbol?.toLowerCase() || '';
  const name = token.name?.toLowerCase() || '';
  
  return symbol === q || name === q || symbol.includes(q) || name.includes(q);
}

function formatComprehensiveTokenData(pool: any, token: any, type: 'base' | 'quote') {
  const attrs = pool.attributes || {};
  const transactions = attrs.transactions || {};
  
  return {
    symbol: token.symbol || 'UNKNOWN',
    name: token.name || 'Unknown',
    address: token.address || '',
    price: type === 'base' ? (attrs.base_token_price_usd || 0) : (attrs.quote_token_price_usd || 0),
    market_cap: attrs.fdv_usd || 0,
    volume_24h: attrs.volume_usd?.h24 || 0,
    price_changes: attrs.price_change_percentage || {},
    liquidity: attrs.reserve_in_usd || 0,
    transactions: transactions,
    pool_address: pool.id,
    network: 'pepe-unchained',
    source: 'pool_search'
  };
}

async function getBroaderMarketContext() {
  try {
    console.log('🌍 Getting broader market context...');
    
    // Get global crypto market data
    const globalResponse = await fetch('https://api.coingecko.com/api/v3/global', {
      headers: { 'Accept': 'application/json' }
    });
    
    const globalData = globalResponse.ok ? await globalResponse.json() : null;
    
    // Get trending searches
    const trendingResponse = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      headers: { 'Accept': 'application/json' }
    });
    
    const trendingData = trendingResponse.ok ? await trendingResponse.json() : null;
    
    return {
      global_market_cap: globalData?.data?.total_market_cap?.usd || 0,
      market_cap_change_24h: globalData?.data?.market_cap_change_percentage_24h_usd || 0,
      active_cryptocurrencies: globalData?.data?.active_cryptocurrencies || 0,
      trending_searches: trendingData?.coins || [],
      market_dominance: globalData?.data?.market_cap_percentage || {}
    };
  } catch (error) {
    console.error('Broader market context error:', error);
    return null;
  }
}

async function getAdvancedTradingData(tokens: string[]) {
  try {
    console.log('⚡ Getting advanced trading data...');
    
    const tradingData = [];
    
    for (const token of tokens.slice(0, 3)) {
      if (token.startsWith('0x')) {
        // Get trades data for contract
        const tradesResponse = await fetch(`https://api.geckoterminal.com/api/v2/networks/pepe-unchained/tokens/${token}/trades`);
        
        if (tradesResponse.ok) {
          const trades = await tradesResponse.json();
          tradingData.push({
            token: token,
            recent_trades: trades.data || [],
            trade_count: trades.data?.length || 0
          });
        }
      }
    }
    
    return tradingData;
  } catch (error) {
    console.error('Advanced trading data error:', error);
    return [];
  }
}

async function generateIntelligentResponse(message: string, intent: any, comprehensiveData: any) {
  const systemPrompt = `You are VaultGPT, an advanced cryptocurrency market intelligence system with access to comprehensive real-time data.

DATA SOURCES AVAILABLE:
- Pepe Unchained native token (PEPU) with full pool analytics
- Complete presale ecosystem data from GraphQL
- Trending pools and new launches on Pepe Unchained
- Global gainers/losers from CoinGecko
- New token listings and market context
- Advanced trading data and transaction analysis
- OHLCV chart data and technical indicators

ANALYSIS CAPABILITIES:
- Multi-timeframe price analysis (1h, 6h, 24h, 7d)
- Ecosystem health and growth metrics
- Comparative performance analysis
- Market sentiment and trend identification
- Risk assessment with specific metrics
- Trading opportunities and recommendations

USER INTENT CONTEXT:
${JSON.stringify(intent, null, 2)}

RESPONSE GUIDELINES:
- Use all available data sources for comprehensive analysis
- Provide specific numbers, percentages, and metrics
- Give clear investment insights and recommendations
- Compare tokens and market performance when relevant
- Explain trends and provide context
- Use plain text formatting (no markdown)
- Be confident and data-driven

Focus on what the user specifically asked for while providing comprehensive market intelligence.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "system", 
          content: `COMPREHENSIVE MARKET DATA:
${JSON.stringify(comprehensiveData, null, 2)}`
        },
        { role: "user", content: message }
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Intelligent response generation error:', error);
    
    // Comprehensive fallback using all data
    return generateComprehensiveFallback(message, intent, comprehensiveData);
  }
}

function generateComprehensiveFallback(message: string, intent: any, data: any) {
  let response = "VaultGPT Comprehensive Market Analysis\n\n";
  
  // PEPU Analysis
  if (data.pepuData) {
    const pepu = data.pepuData;
    response += `PEPE UNCHAINED (PEPU) ANALYSIS:\n`;
    response += `Current Price: $${pepu.price?.toFixed(8) || 'N/A'}\n`;
    response += `Market Cap: $${pepu.market_cap?.toLocaleString() || 'N/A'}\n`;
    response += `24h Volume: $${pepu.volume_24h?.toLocaleString() || 'N/A'}\n`;
    
    if (pepu.price_changes) {
      response += `Price Changes - 1h: ${pepu.price_changes.h1?.toFixed(2) || 'N/A'}% | 24h: ${pepu.price_changes.h24?.toFixed(2) || 'N/A'}%\n`;
    }
    
    response += `Liquidity: $${pepu.liquidity?.toLocaleString() || 'N/A'}\n\n`;
  }
  
  // Ecosystem Health
  if (data.presaleData) {
    const ecosystem = data.presaleData;
    response += `ECOSYSTEM HEALTH:\n`;
    response += `Total Presales: ${ecosystem.total_presales || 0}\n`;
    response += `Active Launches: ${ecosystem.active_presales || 0}\n`;
    response += `Activity Level: ${ecosystem.ecosystem_activity || 'unknown'}\n`;
    response += `Total Raised: $${ecosystem.total_raised?.toLocaleString() || 'N/A'}\n\n`;
  }
  
  // Market Performance
  if (data.gainersLosersData) {
    const performance = data.gainersLosersData;
    response += `MARKET PERFORMANCE:\n`;
    response += `Pepe Unchained Gainers: ${performance.pepu_gainers?.length || 0}\n`;
    response += `Pepe Unchained Losers: ${performance.pepu_losers?.length || 0}\n`;
    response += `Market Sentiment: ${performance.market_sentiment || 'neutral'}\n\n`;
    
    if (performance.pepu_gainers?.length > 0) {
      response += `Top Pepe Unchained Gainer: ${performance.pepu_gainers[0].symbol} (+${performance.pepu_gainers[0].price_change_24h.toFixed(2)}%)\n`;
    }
  }
  
  // Trending Data
  if (data.trendingData) {
    const trending = data.trendingData;
    response += `TRENDING ANALYSIS:\n`;
    response += `Trending Pools: ${trending.trending_pools?.length || 0}\n`;
    response += `New Pools: ${trending.new_pools?.length || 0}\n`;
    response += `Network Growth: ${trending.network_growth || 'steady'}\n\n`;
  }
  
  // Specific Token Data
  if (data.specificTokensData?.length > 0) {
    response += `SPECIFIC TOKEN ANALYSIS:\n`;
    data.specificTokensData.forEach((token: any) => {
      response += `${token.name} (${token.symbol}):\n`;
      response += `  Price: $${token.price?.toFixed(8) || 'N/A'}\n`;
      response += `  Market Cap: $${token.market_cap?.toLocaleString() || 'N/A'}\n`;
      response += `  24h Volume: $${token.volume_24h?.toLocaleString() || 'N/A'}\n`;
      response += `  Network: ${token.network}\n\n`;
    });
  }
  
  response += `Data Sources: ${Object.keys(data).join(', ')}\n`;
  response += `Analysis Type: ${intent.analysisType || 'comprehensive'}\n`;
  
  return response;
}