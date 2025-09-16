import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GeckoTerminal API Configuration (from HiveFi)
const GECKO_TERMINAL_API = "https://api.geckoterminal.com/api/v2";
const PEPE_UNCHAINED_NETWORK = "pepe-unchained";

// Dynamic token database that gets loaded from JSON file
let KNOWN_TOKENS: Record<string, string> = {};
let lastTokenUpdate = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load tokens from JSON file
async function loadTokensFromJSON(): Promise<Record<string, string>> {
  try {
    const filePath = join(process.cwd(), 'pepe-unchained-tokens.json');
    const content = await readFile(filePath, 'utf-8');
    const tokenData = JSON.parse(content);
    
    // Convert all keys to lowercase for easier matching
    const normalizedTokens: Record<string, string> = {};
    if (tokenData.tokens) {
      for (const [key, value] of Object.entries(tokenData.tokens)) {
        normalizedTokens[key.toLowerCase()] = value as string;
      }
    }
    
    console.log(`📄 Loaded ${Object.keys(normalizedTokens).length} tokens from JSON file`);
    return normalizedTokens;
  } catch (error) {
    console.error('Failed to load tokens from JSON:', error);
    return {};
  }
}

// Fallback hardcoded tokens (subset for safety)
function getFallbackTokens(): Record<string, string> {
  return {
    'pepu': '0x4be3af53800aade09201654cd76d55063c7bde70',
    'pepe unchained': '0x4be3af53800aade09201654cd76d55063c7bde70',
    'penk': '0x82144c93bd531e46f31033fe22d1055af17a514c',
    '$penk': '0x82144c93bd531e46f31033fe22d1055af17a514c',
    'pepu bank': '0x82144c93bd531e46f31033fe22d1055af17a514c',
    'spring': '0x28dd14d951cc1b9ff32bdc27dcc7da04fbfe3af6',
    '$spring': '0x28dd14d951cc1b9ff32bdc27dcc7da04fbfe3af6',
    'springfield': '0x28dd14d951cc1b9ff32bdc27dcc7da04fbfe3af6',
    'vault': '0x8746d6fc80708775461226657a6947497764bbe6',
    '$vault': '0x8746d6fc80708775461226657a6947497764bbe6',
    'pepu vault': '0x8746d6fc80708775461226657a6947497764bbe6',
  };
}

// Cached token loading function
async function getKnownTokens(): Promise<Record<string, string>> {
  const now = Date.now();
  
  // Return cached tokens if still valid
  if (Object.keys(KNOWN_TOKENS).length > 0 && (now - lastTokenUpdate) < TOKEN_CACHE_DURATION) {
    return KNOWN_TOKENS;
  }
  
  // Load from JSON file
  const tokens = await loadTokensFromJSON();
  
  // Fallback if loading fails
  if (Object.keys(tokens).length === 0) {
    console.warn('Failed to load JSON tokens, using fallback');
    KNOWN_TOKENS = getFallbackTokens();
  } else {
    KNOWN_TOKENS = tokens;
  }
  
  lastTokenUpdate = now;
  console.log(`✅ Loaded ${Object.keys(KNOWN_TOKENS).length} tokens`);
  return KNOWN_TOKENS;
}

// Updated helper function to find token address by name/symbol
async function findTokenAddress(query: string): Promise<string | null> {
  const tokens = await getKnownTokens();
  const q = query.toLowerCase().trim();
  return tokens[q] || null;
}

interface GeckoTerminalResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Pool {
  id: string;
  attributes: {
    name: string;
    base_token: {
      symbol: string;
      name: string;
      address: string;
    };
    quote_token: {
      symbol: string;
      name: string;
      address: string;
    };
    base_token_price_usd: string;
    quote_token_price_usd: string;
    fdv_usd: string;
    market_cap_usd: string;
    volume_usd: {
      h24: string;
      h6: string;
      h1: string;
    };
    price_change_percentage: {
      h24: string;
      h6: string;
      h1: string;
    };
    reserve_in_usd: string;
    transactions: {
      h24: {
        count: number;
      };
    };
  };
}

interface Token {
  id: string;
  attributes: {
    symbol: string;
    name: string;
    address: string;
    price_usd: string;
  };
}

// GeckoTerminal API Client (adapted from HiveFi)
class GeckoTerminalClient {
  private async makeRequest<T>(endpoint: string): Promise<GeckoTerminalResponse<T>> {
    try {
      console.log(`🦎 GeckoTerminal API: ${endpoint}`);
      
      const response = await fetch(`${GECKO_TERMINAL_API}${endpoint}`, {
        headers: {
          'Accept': 'application/json;version=20230302'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API Error: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('GeckoTerminal API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Search pools on Pepe Unchained network
  async searchPools(query: string): Promise<GeckoTerminalResponse<{ data: Pool[] }>> {
    return this.makeRequest(`/search/pools?network=${PEPE_UNCHAINED_NETWORK}&query=${encodeURIComponent(query)}`);
  }

  // Search tokens by symbol/name (adding missing functionality)
  async searchTokens(query: string): Promise<GeckoTerminalResponse<{ data: Token[] }>> {
    return this.makeRequest(`/search/tokens?network=${PEPE_UNCHAINED_NETWORK}&query=${encodeURIComponent(query)}`);
  }

  // Get trending pools on Pepe Unchained
  async getTrendingPools(): Promise<GeckoTerminalResponse<{ data: Pool[] }>> {
    return this.makeRequest(`/networks/${PEPE_UNCHAINED_NETWORK}/trending_pools`);
  }

  // Get new pools on Pepe Unchained
  async getNewPools(): Promise<GeckoTerminalResponse<{ data: Pool[] }>> {
    return this.makeRequest(`/networks/${PEPE_UNCHAINED_NETWORK}/new_pools`);
  }

  // Get top pools on Pepe Unchained
  async getTopPools(limit: number = 100): Promise<GeckoTerminalResponse<{ data: Pool[] }>> {
    return this.makeRequest(`/networks/${PEPE_UNCHAINED_NETWORK}/pools?page=1&limit=${limit}`);
  }

  // Get specific pool info
  async getPoolInfo(poolAddress: string): Promise<GeckoTerminalResponse<{ data: Pool }>> {
    return this.makeRequest(`/networks/${PEPE_UNCHAINED_NETWORK}/pools/${poolAddress}`);
  }

  // Get token info by address - Updated to use actual response structure
  async getTokenInfo(tokenAddress: string): Promise<GeckoTerminalResponse<any>> {
    return this.makeRequest(`/networks/${PEPE_UNCHAINED_NETWORK}/tokens/${tokenAddress}`);
  }

  // Get token pools
  async getTokenPools(tokenAddress: string): Promise<GeckoTerminalResponse<{ data: Pool[] }>> {
    return this.makeRequest(`/networks/${PEPE_UNCHAINED_NETWORK}/tokens/${tokenAddress}/pools`);
  }

  // Get network stats (adapted from HiveFi)
  async getNetworkStats() {
    const topPoolsResponse = await this.getTopPools(50);
    if (!topPoolsResponse.success || !topPoolsResponse.data) {
      return null;
    }

    const pools = topPoolsResponse.data.data;
    const totalLiquidity = pools.reduce((sum, pool) => 
      sum + parseFloat(pool.attributes.reserve_in_usd || '0'), 0
    );
    const totalVolume24h = pools.reduce((sum, pool) => 
      sum + parseFloat(pool.attributes.volume_usd?.h24 || '0'), 0
    );

    return {
      total_pools: pools.length,
      total_liquidity: totalLiquidity,
      total_volume_24h: totalVolume24h,
      top_pools: pools.slice(0, 10).map(pool => this.formatPoolInfo(pool))
    };
  }

  // Format pool info (from HiveFi pattern) - Fixed for actual API structure
  private formatPoolInfo(pool: any) {
    // Handle both pool and token data structures
    const attrs = pool.attributes || {};
    
    if (attrs.base_token && attrs.quote_token) {
      // This is pool data
      return {
        name: attrs.name,
        base_token: {
          symbol: attrs.base_token.symbol,
          name: attrs.base_token.name,
          address: attrs.base_token.address,
          price_usd: parseFloat(attrs.base_token_price_usd || '0')
        },
        quote_token: {
          symbol: attrs.quote_token.symbol,
          name: attrs.quote_token.name,
          address: attrs.quote_token.address,
          price_usd: parseFloat(attrs.quote_token_price_usd || '0')
        },
        market_cap: parseFloat(attrs.fdv_usd || '0'),
        volume_24h: parseFloat(attrs.volume_usd?.h24 || '0'),
        price_change_24h: parseFloat(attrs.price_change_percentage?.h24 || '0'),
        liquidity: parseFloat(attrs.reserve_in_usd || '0'),
        transactions_24h: attrs.transactions?.h24?.count || 0,
        pool_address: pool.id
      };
    } else {
      // This is token data - format accordingly
      return {
        name: attrs.name,
        symbol: attrs.symbol,
        address: attrs.address,
        price: parseFloat(attrs.price_usd || '0'),
        market_cap: parseFloat(attrs.fdv_usd || '0'),
        volume_24h: parseFloat(attrs.volume_usd?.h24 || '0'),
        liquidity: parseFloat(attrs.total_reserve_in_usd || '0'),
        pool_address: pool.id || ''
      };
    }
  }
}

// Initialize client
const geckoClient = new GeckoTerminalClient();

// Chart Analysis Functions
async function analyzeTradingPatterns(tokenAddress: string) {
  try {
    console.log(`📈 Analyzing trading patterns for ${tokenAddress}`);
    
    // Get token pools to find the main trading pool
    const poolsResponse = await fetch(`${GECKO_TERMINAL_API}/networks/${PEPE_UNCHAINED_NETWORK}/tokens/${tokenAddress}/pools`);
    if (!poolsResponse.ok) {
      console.log(`❌ No pools found for ${tokenAddress}`);
      return null;
    }
    
    const poolsData = await poolsResponse.json();
    const pools = poolsData?.data || [];
    
    if (pools.length === 0) {
      console.log(`❌ No trading pools found for ${tokenAddress}`);
      return null;
    }
    
    // Get the top pool (highest liquidity)
    const topPool = pools[0];
    const poolAddress = topPool.id.split('_')[1];
    
    console.log(`🔍 Analyzing pool: ${poolAddress}`);
    
    // Get pool candles for analysis
    const candlesResponse = await fetch(`${GECKO_TERMINAL_API}/networks/${PEPE_UNCHAINED_NETWORK}/pools/${poolAddress}/ohlcv/minute?aggregate=1&limit=1000`);
    if (!candlesResponse.ok) {
      console.log(`❌ No candle data available for pool ${poolAddress}`);
      return null;
    }
    
    const candlesData = await candlesResponse.json();
    const candles = candlesData?.data?.attributes?.ohlcv_list || [];
    
    if (candles.length === 0) {
      console.log(`❌ No candle data found`);
      return null;
    }
    
    console.log(`📊 Analyzing ${candles.length} candles`);
    
    // Analyze patterns
    const analysis = analyzeCandlePatterns(candles);
    
    return {
      poolAddress,
      candleCount: candles.length,
      analysis,
      latestPrice: candles[0]?.[4] || 0,
      volume24h: candles.slice(0, 1440).reduce((sum: number, candle: number[]) => sum + candle[5], 0), // Last 24h volume
      priceChange24h: candles.length > 1440 ? 
        ((candles[0][4] - candles[1440][4]) / candles[1440][4]) * 100 : 0
    };
    
  } catch (error) {
    console.error('Error analyzing trading patterns:', error);
    return null;
  }
}

function analyzeCandlePatterns(candles: number[][]) {
  if (candles.length < 10) {
    return {
      suspicious: false,
      pattern: 'insufficient_data',
      riskLevel: 'unknown',
      analysis: 'Not enough data for pattern analysis'
    };
  }
  
  const recent = candles.slice(0, 100); // Last 100 candles
  const prices = recent.map(c => c[4]); // Close prices
  const volumes = recent.map(c => c[5]); // Volumes
  
  // Calculate metrics
  const priceVolatility = calculateVolatility(prices);
  const volumeSpikes = detectVolumeSpikes(volumes);
  const pricePattern = detectPricePattern(prices);
  const liquidityHealth = analyzeLiquidityHealth(candles);
  
  // Determine if suspicious
  const suspicious = 
    volumeSpikes.count > 5 || // Too many volume spikes
    priceVolatility > 50 || // Extreme volatility
    pricePattern === 'pump_and_dump' ||
    liquidityHealth.score < 30;
  
  let riskLevel = 'low';
  let pattern = 'healthy';
  
  if (suspicious) {
    riskLevel = 'high';
    pattern = 'suspicious';
  } else if (priceVolatility > 20 || volumeSpikes.count > 2) {
    riskLevel = 'medium';
    pattern = 'volatile';
  }
  
  return {
    suspicious,
    pattern,
    riskLevel,
    volatility: priceVolatility,
    volumeSpikes: volumeSpikes.count,
    liquidityScore: liquidityHealth.score,
    analysis: generatePatternAnalysis(suspicious, pattern, riskLevel, priceVolatility, volumeSpikes.count)
  };
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i-1] - prices[i]) / prices[i]);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Return as percentage
}

function detectVolumeSpikes(volumes: number[]): { count: number, spikes: number[] } {
  if (volumes.length < 10) return { count: 0, spikes: [] };
  
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const threshold = avgVolume * 3; // 3x average volume
  
  const spikes = volumes.filter(v => v > threshold);
  
  return {
    count: spikes.length,
    spikes: spikes.slice(0, 5) // Top 5 spikes
  };
}

function detectPricePattern(prices: number[]): string {
  if (prices.length < 20) return 'insufficient_data';
  
  const first = prices[prices.length - 1];
  const middle = prices[Math.floor(prices.length / 2)];
  const last = prices[0];
  
  // Check for pump and dump pattern
  if (middle > first * 1.5 && last < middle * 0.7) {
    return 'pump_and_dump';
  }
  
  // Check for steady decline
  if (last < first * 0.8) {
    return 'declining';
  }
  
  // Check for steady growth
  if (last > first * 1.2) {
    return 'growing';
  }
  
  return 'stable';
}

function analyzeLiquidityHealth(candles: number[][]): { score: number, analysis: string } {
  if (candles.length < 10) return { score: 50, analysis: 'Insufficient data' };
  
  const recent = candles.slice(0, 50);
  const avgVolume = recent.reduce((sum, c) => sum + c[5], 0) / recent.length;
  const priceRange = Math.max(...recent.map(c => c[2])) - Math.min(...recent.map(c => c[3]));
  const avgPrice = recent.reduce((sum, c) => sum + c[4], 0) / recent.length;
  
  // Calculate liquidity score (0-100)
  let score = 100;
  
  // Penalize low volume
  if (avgVolume < 1000) score -= 30;
  else if (avgVolume < 10000) score -= 15;
  
  // Penalize high volatility relative to price
  const volatilityRatio = priceRange / avgPrice;
  if (volatilityRatio > 0.5) score -= 25;
  else if (volatilityRatio > 0.2) score -= 10;
  
  // Penalize inconsistent volume
  const volumeVariance = recent.reduce((sum, c) => sum + Math.pow(c[5] - avgVolume, 2), 0) / recent.length;
  const volumeStdDev = Math.sqrt(volumeVariance);
  const volumeCoeff = volumeStdDev / avgVolume;
  
  if (volumeCoeff > 2) score -= 20;
  else if (volumeCoeff > 1) score -= 10;
  
  let analysis = '';
  if (score >= 80) analysis = 'Healthy liquidity with consistent trading';
  else if (score >= 60) analysis = 'Moderate liquidity, some concerns';
  else if (score >= 40) analysis = 'Low liquidity, high risk';
  else analysis = 'Very poor liquidity, avoid trading';
  
  return { score: Math.max(0, score), analysis };
}

function generatePatternAnalysis(suspicious: boolean, pattern: string, riskLevel: string, volatility: number, volumeSpikes: number): string {
  if (suspicious) {
    return `🚨 SUSPICIOUS ACTIVITY DETECTED: High volatility (${volatility.toFixed(1)}%), ${volumeSpikes} volume spikes. This looks like manipulation or a pump-and-dump scheme. AVOID THIS TOKEN.`;
  }
  
  if (riskLevel === 'high') {
    return `⚠️ HIGH RISK: Volatility ${volatility.toFixed(1)}%, ${volumeSpikes} volume spikes. Proceed with extreme caution.`;
  }
  
  if (riskLevel === 'medium') {
    return `⚡ MODERATE RISK: Some volatility (${volatility.toFixed(1)}%) and volume activity. Monitor closely.`;
  }
  
  return `✅ HEALTHY PATTERN: Low volatility (${volatility.toFixed(1)}%), stable volume. This appears to be legitimate trading activity.`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, selectedTokens, walletTokens } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('🚀 VaultGPT Enhanced Analysis:', message);
    console.log('🎯 Selected tokens:', selectedTokens?.length || 0);
    console.log('💰 Wallet tokens:', walletTokens?.length || 0);

    // Analyze user intent
    const userIntent = await analyzeUserIntent(message);
    console.log('🧠 User intent:', userIntent);

    // Search for tokens using dynamic loading
    const searchResults = await searchForTokens(userIntent.tokens);
    console.log('🔍 Search results:', searchResults.map(r => r.symbol));

    // Get additional market data
    const marketData = await getMarketData(userIntent, searchResults);

    // Generate response with selected tokens context
    const response = await generateResponse(message, userIntent, searchResults, marketData, selectedTokens, walletTokens);

    return NextResponse.json({ 
      response,
      tokensFound: searchResults.length,
      tokens: searchResults.map(t => ({ 
        symbol: t.symbol, 
        name: t.name, 
        price: t.price,
        market_cap: t.market_cap || null,
        volume_24h: t.volume_24h || null,
        price_change_24h: t.price_change_24h || null,
        liquidity: t.liquidity || null,
        address: t.address || '',
        source: t.source 
      }))
    });

  } catch (error) {
    console.error('❌ VaultGPT Error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        response: "I'm having trouble accessing market data. Please try again."
      }, 
      { status: 500 }
    );
  }
}

async function analyzeUserIntent(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Analyze the crypto query and extract information. Look for:

TOKENS: Any token names, symbols, addresses mentioned
QUERY TYPES:
- "tell me about X" = token analysis
- "X price" = price query  
- "compare X and Y" = comparison
- "trending" = trending analysis
- "top gainers/losers" = performance ranking
- "new tokens/launches" = new listings
- "volume leaders" = volume analysis
- "best performing" = performance analysis
- "analyze X" = deep analysis
- "X vs Y" = comparison
- "market overview" = general market
- "what's hot" = trending
- Contract addresses (0x...)

Return JSON with:
{
  "tokens": ["token1", "token2"],
  "analysisType": "price|performance|comparison|trending|new_launches|volume|market_overview|deep_analysis|gainers_losers|general",
  "queryType": "single_token|comparison|market_wide|trending|address_lookup|general",
  "needsMarketContext": boolean,
  "timeframe": "1h|24h|7d|recent",
  "specificRequest": "brief description of what user wants"
}`
      },
      {
        role: "user",
        content: message
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  
  // Enhanced token extraction patterns
  const lowerMessage = message.toLowerCase();
  const words = message.split(/\s+/);
  
  // Pattern: "tell me about X", "about X", "analyze X"
  const aboutPattern = /(tell me about|about|analyze|info on|check|lookup)\s+(\w+)/i;
  const aboutMatch = message.match(aboutPattern);
  if (aboutMatch) {
    const token = aboutMatch[2];
    if (!result.tokens) result.tokens = [];
    if (!result.tokens.includes(token)) {
      result.tokens.push(token);
    }
  }
  
  // Pattern: "X price", "X performance" 
  const pricePattern = /(\w+)\s+(price|performance|chart|stats)/i;
  const priceMatch = message.match(pricePattern);
  if (priceMatch) {
    const token = priceMatch[1];
    if (!result.tokens) result.tokens = [];
    if (!result.tokens.includes(token)) {
      result.tokens.push(token);
    }
  }
  
  // Pattern: Contract addresses
  const addressPattern = /0x[a-fA-F0-9]{40}/g;
  const addresses = message.match(addressPattern);
  if (addresses) {
    if (!result.tokens) result.tokens = [];
    addresses.forEach(addr => {
      if (!result.tokens.includes(addr)) {
        result.tokens.push(addr);
      }
    });
    result.queryType = "address_lookup";
  }
  
  // Pattern: "X vs Y", "compare X and Y"
  const vsPattern = /(\w+)\s+(vs|versus|compared to)\s+(\w+)/i;
  const comparePattern = /compare\s+(\w+)\s+(and|with)\s+(\w+)/i;
  const vsMatch = message.match(vsPattern) || message.match(comparePattern);
  if (vsMatch) {
    if (!result.tokens) result.tokens = [];
    if (vsMatch[1] && !result.tokens.includes(vsMatch[1])) result.tokens.push(vsMatch[1]);
    if (vsMatch[3] && !result.tokens.includes(vsMatch[3])) result.tokens.push(vsMatch[3]);
    result.analysisType = "comparison";
    result.queryType = "comparison";
  }

  return result;
}

async function searchForTokens(tokens: string[]) {
  if (!tokens || tokens.length === 0) return [];
  
  const results = [];
  
  for (const token of tokens.slice(0, 5)) {
    console.log(`🔍 Searching for: ${token}`);
    
    // Check if it's a contract address
    if (token.startsWith('0x') && token.length === 42) {
      console.log(`📍 Contract address detected: ${token}`);
      const tokenData = await getTokenByAddress(token);
      if (tokenData) {
        results.push(tokenData);
        continue;
      }
    }
    
    // Strategy 1: Check dynamic tokens database first
    const knownAddress = await findTokenAddress(token);
    if (knownAddress) {
      console.log(`✅ Found in database: ${token} -> ${knownAddress}`);
      const tokenData = await getTokenByAddress(knownAddress);
      if (tokenData) {
        results.push(tokenData);
        continue;
      }
    }
    
    // Strategy 2: Dynamic search - scan all pools for uncommon tokens
    const tokenData = await dynamicTokenSearch(token);
    if (tokenData) {
      results.push(tokenData);
      console.log(`✅ Found via dynamic search: ${tokenData.symbol}`);
      continue;
    }
    
    console.log(`❌ Not found: ${token}`);
  }
  
  return results;
}

// Dynamic search for uncommon tokens by scanning all pools
async function dynamicTokenSearch(query: string) {
  try {
    console.log(`🔍 Dynamic search for: ${query}`);
    
    // Get all pools and scan for matching tokens
    const poolsResponse = await geckoClient.getTopPools(200); // Get more pools
    if (!poolsResponse.success || !poolsResponse.data?.data) {
      return null;
    }
    
    const pools = poolsResponse.data.data;
    let bestMatch = null;
    let bestVolume = 0;
    
    // Search through all tokens in all pools
    for (const pool of pools) {
      const baseToken = pool.attributes?.base_token;
      const quoteToken = pool.attributes?.quote_token;
      
      if (baseToken && tokenMatches(baseToken, query)) {
        const volume = parseFloat(pool.attributes.volume_usd?.h24 || '0');
        // Prioritize pools with higher volume for more accurate data
        if (volume > bestVolume) {
          bestMatch = {
            token: baseToken,
            pool: pool,
            isBase: true
          };
          bestVolume = volume;
        }
      }
      
      if (quoteToken && tokenMatches(quoteToken, query)) {
        const volume = parseFloat(pool.attributes.volume_usd?.h24 || '0');
        // Prioritize pools with higher volume for more accurate data
        if (volume > bestVolume) {
          bestMatch = {
            token: quoteToken,
            pool: pool,
            isBase: false
          };
          bestVolume = volume;
        }
      }
    }
    
    if (bestMatch) {
      const { token, pool, isBase } = bestMatch;
      console.log(`✅ Best match found for ${query}:`, {
        symbol: token.symbol,
        volume: pool.attributes.volume_usd?.h24,
        liquidity: pool.attributes.reserve_in_usd,
        price_change: pool.attributes.price_change_percentage?.h24
      });
   
    return {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        price: isBase ? parseFloat(pool.attributes.base_token_price_usd || '0') : parseFloat(pool.attributes.quote_token_price_usd || '0'),
        market_cap: parseFloat(pool.attributes.fdv_usd || '0'),
        volume_24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
        price_change_24h: parseFloat(pool.attributes.price_change_percentage?.h24 || '0'),
        liquidity: parseFloat(pool.attributes.reserve_in_usd || '0'),
        transactions_24h: pool.attributes.transactions?.h24?.count || 0,
        pool_address: pool.id,
        source: 'dynamic_pool_scan'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Dynamic search error:', error);
    return null;
  }
}

// Data validation function to ensure accuracy
function validateTokenData(tokenData: any) {
  const validation = {
    isValid: true,
    warnings: [] as string[],
    confidence: 'high' as 'high' | 'medium' | 'low'
  };
  
  // Check for unrealistic values
  if (tokenData.volume_24h > 0) {
    // Volume should not be more than 10x market cap (unrealistic)
    if (tokenData.market_cap > 0 && tokenData.volume_24h > tokenData.market_cap * 10) {
      validation.warnings.push('Volume appears unusually high relative to market cap');
      validation.confidence = 'medium';
    }
    
    // Volume should not be 0 if there's significant liquidity
    if (tokenData.volume_24h === 0 && tokenData.liquidity > 1000) {
      validation.warnings.push('Zero volume despite significant liquidity - data may be stale');
      validation.confidence = 'low';
    }
  }
  
  // Check liquidity consistency
  if (tokenData.liquidity > 0) {
    // Liquidity should not be more than 5x market cap (unrealistic)
    if (tokenData.market_cap > 0 && tokenData.liquidity > tokenData.market_cap * 5) {
      validation.warnings.push('Liquidity appears unusually high relative to market cap');
      validation.confidence = 'medium';
    }
  }
  
  // Check price change consistency
  if (tokenData.price_change_24h !== 0) {
    // Extreme price changes should have corresponding volume
    if (Math.abs(tokenData.price_change_24h) > 50 && tokenData.volume_24h < 1000) {
      validation.warnings.push('Large price change with low volume - data may be unreliable');
      validation.confidence = 'low';
    }
  }
  
  if (validation.warnings.length > 0) {
    validation.isValid = false;
  }
  
  return validation;
}

// Get real-time data from multiple sources for cross-validation
async function getRealTimeTokenData(address: string) {
  try {
    console.log(`🔄 Getting real-time data for ${address} from multiple sources...`);
    
    // Source 1: Direct token info
    const tokenResponse = await geckoClient.getTokenInfo(address);
    
    // Source 2: Token pools
    const poolsResponse = await geckoClient.getTokenPools(address);
    
    // Source 3: Search in top pools
    const topPoolsResponse = await geckoClient.getTopPools(200);
    
    const dataSources = [];
    
    if (tokenResponse.success && tokenResponse.data?.data) {
      const tokenVolume = parseFloat(tokenResponse.data.data.attributes.volume_usd?.h24 || '0');
      const tokenLiquidity = parseFloat(tokenResponse.data.data.attributes.total_reserve_in_usd || '0');
      console.log(`📊 Token Info Source - Volume: $${tokenVolume}, Liquidity: $${tokenLiquidity}`);
      
      dataSources.push({
        source: 'token_info',
        volume: tokenVolume,
        liquidity: tokenLiquidity,
        price: parseFloat(tokenResponse.data.data.attributes.price_usd || '0'),
        weight: 0.3 // Lower weight for potentially stale data
      });
    }
    
    if (poolsResponse.success && poolsResponse.data?.data && poolsResponse.data.data.length > 0) {
      // Get the pool with highest volume
      const bestPool = poolsResponse.data.data.reduce((best, current) => {
        const currentVolume = parseFloat(current.attributes.volume_usd?.h24 || '0');
        const bestVolume = parseFloat(best.attributes.volume_usd?.h24 || '0');
        return currentVolume > bestVolume ? current : best;
      });
      
      const poolVolume = parseFloat(bestPool.attributes.volume_usd?.h24 || '0');
      const poolLiquidity = parseFloat(bestPool.attributes.reserve_in_usd || '0');
      console.log(`🏊 Pool Source - Volume: $${poolVolume}, Liquidity: $${poolLiquidity} (Pool: ${bestPool.id})`);
      
      dataSources.push({
        source: 'token_pools',
        volume: poolVolume,
        liquidity: poolLiquidity,
        price: parseFloat(bestPool.attributes.base_token_price_usd || '0'),
        weight: 0.7, // Higher weight for pool data
        poolId: bestPool.id
      });
    }
    
    if (topPoolsResponse.success && topPoolsResponse.data?.data) {
      // Find this token in top pools
      for (const pool of topPoolsResponse.data.data) {
        const baseToken = pool.attributes?.base_token;
        const quoteToken = pool.attributes?.quote_token;
        
        if (baseToken?.address?.toLowerCase() === address.toLowerCase() || 
            quoteToken?.address?.toLowerCase() === address.toLowerCase()) {
          
          const topPoolVolume = parseFloat(pool.attributes.volume_usd?.h24 || '0');
          const topPoolLiquidity = parseFloat(pool.attributes.reserve_in_usd || '0');
          console.log(`🔝 Top Pool Source - Volume: $${topPoolVolume}, Liquidity: $${topPoolLiquidity} (Pool: ${pool.id})`);
          
          dataSources.push({
            source: 'top_pools',
            volume: topPoolVolume,
            liquidity: topPoolLiquidity,
            price: parseFloat(pool.attributes.base_token_price_usd || '0'),
            weight: 0.8, // Highest weight for top pool data
            poolId: pool.id
          });
          break;
        }
      }
    }
    
    if (dataSources.length === 0) {
      return null;
    }
    
    // Calculate weighted averages, prioritizing the most reliable sources
    let totalWeightedVolume = 0;
    let totalWeightedLiquidity = 0;
    let totalWeightedPrice = 0;
    let totalWeight = 0;
    
    console.log(`\n📊 Data Source Analysis:`);
    dataSources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source.source} (Weight: ${source.weight})`);
      console.log(`     Volume: $${source.volume}, Liquidity: $${source.liquidity}`);
      console.log(`     Pool ID: ${source.poolId || 'N/A'}`);
    });
    
    // SIMPLE FIX: Just pick the source with the highest volume (most active trading)
    // This avoids the weighted averaging that was causing wrong values
    const bestSource = dataSources.reduce((best, current) => {
      return current.volume > best.volume ? current : best;
    });
    
    console.log(`\n🎯 SELECTED BEST SOURCE: ${bestSource.source}`);
    console.log(`  Volume: $${bestSource.volume}, Liquidity: $${bestSource.liquidity}`);
    console.log(`  Pool ID: ${bestSource.poolId || 'N/A'}`);
    
    return {
      volume_24h: bestSource.volume,
      liquidity: bestSource.liquidity,
      price: bestSource.price,
      dataSources: dataSources.length,
      sourceBreakdown: dataSources.map(s => `${s.source}: $${s.liquidity}`),
      selectedSource: bestSource.source
    };
  } catch (error) {
    console.error('Error getting real-time token data:', error);
    return null;
  }
}

async function getTokenByAddress(address: string) {
  try {
    // First try to get token info
    const tokenResponse = await geckoClient.getTokenInfo(address);
    
    if (!tokenResponse.success || !tokenResponse.data?.data) {
      return null;
    }
    
    const tokenData = tokenResponse.data.data;
    
    // Try to get more accurate data from pools
    const poolsResponse = await geckoClient.getTokenPools(address);
    let poolData = null;
    let bestVolume = 0;
    let bestLiquidity = 0;
    
    if (poolsResponse.success && poolsResponse.data?.data && poolsResponse.data.data.length > 0) {
      // Get the pool with highest volume AND liquidity for most accurate data
      const pools = poolsResponse.data.data;
      
      // Find the best pool based on both volume and liquidity
      for (const pool of pools) {
        const volume = parseFloat(pool.attributes.volume_usd?.h24 || '0');
        const liquidity = parseFloat(pool.attributes.reserve_in_usd || '0');
        
        // Score based on both volume and liquidity (weighted)
        const score = (volume * 0.7) + (liquidity * 0.3);
        const bestScore = (bestVolume * 0.7) + (bestLiquidity * 0.3);
        
        if (score > bestScore) {
          poolData = pool;
          bestVolume = volume;
          bestLiquidity = liquidity;
        }
      }
      
      console.log(`✅ Found best pool data for ${address}:`, {
        volume: poolData?.attributes.volume_usd?.h24,
        liquidity: poolData?.attributes.reserve_in_usd,
        price_change: poolData?.attributes.price_change_percentage?.h24,
        pool_id: poolData?.id
      });
    }
    
    // Also try to get data from top pools to cross-reference
    const topPoolsResponse = await geckoClient.getTopPools(100);
    let crossReferenceData = null;
    
    if (topPoolsResponse.success && topPoolsResponse.data?.data) {
      const topPools = topPoolsResponse.data.data;
      
      // Look for this token in top pools for cross-reference
      for (const pool of topPools) {
        const baseToken = pool.attributes?.base_token;
        const quoteToken = pool.attributes?.quote_token;
        
        if ((baseToken && baseToken.address === address) || (quoteToken && quoteToken.address === address)) {
          const volume = parseFloat(pool.attributes.volume_usd?.h24 || '0');
          const liquidity = parseFloat(pool.attributes.reserve_in_usd || '0');
          
          // Use this data if it's better than what we have
          if (volume > bestVolume || liquidity > bestLiquidity) {
            crossReferenceData = pool;
            bestVolume = Math.max(bestVolume, volume);
            bestLiquidity = Math.max(bestLiquidity, liquidity);
            console.log(`✅ Found better cross-reference data for ${address}:`, {
              volume: pool.attributes.volume_usd?.h24,
              liquidity: pool.attributes.reserve_in_usd,
              source: 'top_pools_cross_reference'
            });
          }
        }
      }
    }
    
    // Use the best available data
    const finalPoolData = crossReferenceData || poolData;
    
    // Get real-time data from multiple sources for cross-validation
    const realTimeData = await getRealTimeTokenData(address);
    
    // Validate data quality
    const volume = realTimeData?.volume_24h || (finalPoolData ? parseFloat(finalPoolData.attributes.volume_usd?.h24 || '0') : parseFloat(tokenData.attributes.volume_usd?.h24 || '0'));
    const liquidity = realTimeData?.liquidity || (finalPoolData ? parseFloat(finalPoolData.attributes.reserve_in_usd || '0') : parseFloat(tokenData.attributes.total_reserve_in_usd || '0'));
    
    // Data quality indicators
    const dataQuality = {
      hasPoolData: !!finalPoolData,
      hasCrossReference: !!crossReferenceData,
      hasRealTimeData: !!realTimeData,
      volumeSource: realTimeData ? 'real_time_cross_validation' : (finalPoolData ? 'pool_data' : 'token_data'),
      liquiditySource: realTimeData ? 'real_time_cross_validation' : (finalPoolData ? 'pool_data' : 'token_data'),
      dataConsistency: 'unknown'
    };
    
    console.log(`📊 Data quality for ${address}:`, dataQuality);
    
    const tokenResult = {
      symbol: tokenData.attributes.symbol,
      name: tokenData.attributes.name,
      address: tokenData.attributes.address,
      price: realTimeData?.price || parseFloat(tokenData.attributes.price_usd || '0'),
      market_cap: parseFloat(tokenData.attributes.fdv_usd || '0'),
      // Use the best available data
      volume_24h: volume,
      price_change_24h: finalPoolData ? parseFloat(finalPoolData.attributes.price_change_percentage?.h24 || '0') : 0,
      liquidity: liquidity,
      transactions_24h: finalPoolData ? (finalPoolData.attributes.transactions?.h24?.count || 0) : 0,
      pool_address: finalPoolData ? finalPoolData.id : '',
      source: realTimeData ? 'real_time_validation' : (finalPoolData ? (crossReferenceData ? 'cross_referenced_pool' : 'pool_lookup') : 'direct_lookup'),
      data_quality: dataQuality,
      validation: {} as any // Will be set below
    };
    
    // Validate the data
    const validation = validateTokenData(tokenResult);
    tokenResult.validation = validation;
    
    if (validation.warnings.length > 0) {
      console.log(`⚠️ Data validation warnings for ${address}:`, validation.warnings);
    }
    
    return tokenResult;
  } catch (error) {
    console.error('Error in getTokenByAddress:', error);
    return null;
  }
}

async function searchByPools(query: string) {
  const response = await geckoClient.searchPools(query);
  
  if (!response.success || !response.data?.data) {
    return null;
  }

  const pools = response.data.data;
  
  // Find best matching pool
  for (const pool of pools) {
    const baseToken = pool.attributes.base_token;
    const quoteToken = pool.attributes.quote_token;
    
    if (tokenMatches(baseToken, query)) {
      return {
        symbol: baseToken.symbol,
        name: baseToken.name,
        address: baseToken.address,
        price: parseFloat(pool.attributes.base_token_price_usd || '0'),
        market_cap: parseFloat(pool.attributes.fdv_usd || '0'),
        volume_24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
        price_change_24h: parseFloat(pool.attributes.price_change_percentage?.h24 || '0'),
        liquidity: parseFloat(pool.attributes.reserve_in_usd || '0'),
        transactions_24h: pool.attributes.transactions?.h24?.count || 0,
        pool_address: pool.id,
        source: 'pool_search'
      };
    }
    
    if (tokenMatches(quoteToken, query)) {
      return {
        symbol: quoteToken.symbol,
        name: quoteToken.name,
        address: quoteToken.address,
        price: parseFloat(pool.attributes.quote_token_price_usd || '0'),
        market_cap: parseFloat(pool.attributes.fdv_usd || '0'),
        volume_24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
        price_change_24h: parseFloat(pool.attributes.price_change_percentage?.h24 || '0'),
        liquidity: parseFloat(pool.attributes.reserve_in_usd || '0'),
        transactions_24h: pool.attributes.transactions?.h24?.count || 0,
        pool_address: pool.id,
        source: 'pool_search'
      };
    }
  }
  
  return null;
}

async function searchByTokens(query: string) {
  // Note: This endpoint may not exist, but following HiveFi pattern
  const response = await geckoClient.searchTokens(query);
  
  if (!response.success || !response.data?.data) {
    return null;
  }

  const tokens = response.data.data;
  const bestMatch = tokens.find(token => tokenMatches(token.attributes, query));
  
  if (!bestMatch) return null;
  
  return {
    symbol: bestMatch.attributes.symbol,
    name: bestMatch.attributes.name,
    address: bestMatch.attributes.address,
    price: parseFloat(bestMatch.attributes.price_usd || '0'),
    market_cap: 0, // Token search doesn't provide this
    volume_24h: 0, // Token search doesn't provide this
    price_change_24h: 0, // Token search doesn't provide this
    liquidity: 0, // Token search doesn't provide this
    transactions_24h: 0, // Token search doesn't provide this
    pool_address: '', // Token search doesn't provide this
    source: 'token_search'
  };
}

function tokenMatches(token: any, query: string): boolean {
  if (!token) return false;
  
  const q = query.toLowerCase().trim();
  const symbol = (token.symbol || '').toLowerCase();
  const name = (token.name || '').toLowerCase();
  
  // Exact matches first
  if (symbol === q || name === q) return true;
  
  // Partial matches for longer queries
  if (q.length > 2) {
    if (symbol.includes(q) || name.includes(q)) return true;
  }
  
  return false;
}

async function getMarketData(intent: any, tokens: any[]) {
  const marketData: any = {};
  
  // Always get PEPU data
  const pepuResponse = await geckoClient.getTokenInfo('0x4be3af53800aade09201654cd76d55063c7bde70');
  if (pepuResponse.success && pepuResponse.data) {
    const pepuData = pepuResponse.data.data;
    marketData.pepu = {
      symbol: pepuData.attributes.symbol,
      name: pepuData.attributes.name,
      price: parseFloat(pepuData.attributes.price_usd || '0'),
      market_cap: parseFloat(pepuData.attributes.fdv_usd || '0'),
      volume_24h: parseFloat(pepuData.attributes.volume_usd?.h24 || '0'),
      liquidity: parseFloat(pepuData.attributes.total_reserve_in_usd || '0')
    };
  }
  
  // Get different data based on analysis type
  switch (intent.analysisType) {
    case 'trending':
      const trendingResponse = await geckoClient.getTrendingPools();
      if (trendingResponse.success && trendingResponse.data) {
        marketData.trending = trendingResponse.data.data.slice(0, 10);
      }
      break;
      
    case 'new_launches':
      const newPoolsResponse = await geckoClient.getNewPools();
      if (newPoolsResponse.success && newPoolsResponse.data) {
        marketData.new_launches = newPoolsResponse.data.data.slice(0, 10);
      }
      break;
      
    case 'volume':
    case 'gainers_losers':
    case 'performance':
      const topPoolsResponse = await geckoClient.getTopPools(50);
      if (topPoolsResponse.success && topPoolsResponse.data) {
        const pools = topPoolsResponse.data.data;
        
        // Sort by volume for volume leaders
        if (intent.analysisType === 'volume') {
          marketData.volume_leaders = pools
            .sort((a, b) => parseFloat(b.attributes.volume_usd?.h24 || '0') - parseFloat(a.attributes.volume_usd?.h24 || '0'))
            .slice(0, 10);
        }
        
        // Sort by price change for gainers/losers
        if (intent.analysisType === 'gainers_losers' || intent.analysisType === 'performance') {
          const gainers = pools
            .filter(p => parseFloat(p.attributes.price_change_percentage?.h24 || '0') > 0)
            .sort((a, b) => parseFloat(b.attributes.price_change_percentage?.h24 || '0') - parseFloat(a.attributes.price_change_percentage?.h24 || '0'))
            .slice(0, 5);
            
          const losers = pools
            .filter(p => parseFloat(p.attributes.price_change_percentage?.h24 || '0') < 0)
            .sort((a, b) => parseFloat(a.attributes.price_change_percentage?.h24 || '0') - parseFloat(b.attributes.price_change_percentage?.h24 || '0'))
            .slice(0, 5);
            
          marketData.gainers = gainers;
          marketData.losers = losers;
        }
      }
      break;
      
    case 'market_overview':
      // Get comprehensive market data
      const networkStats = await geckoClient.getNetworkStats();
      if (networkStats) {
        marketData.network = networkStats;
      }
      
      const overviewPools = await geckoClient.getTopPools(20);
      if (overviewPools.success && overviewPools.data) {
        marketData.top_pools = overviewPools.data.data.slice(0, 10);
      }
      break;
  }
  
  return marketData;
}

async function generateResponse(message: string, intent: any, tokens: any[], marketData: any, selectedTokens: any[] = [], walletTokens: any[] = []) {
  if (tokens.length === 0 && intent.tokens?.length > 0) {
    return `I searched for "${intent.tokens.join(', ')}" on the Pepe Unchained network but couldn't find any matching tokens. The tokens may not exist on this network or might be using different names/symbols.`;
  }
  
  // Get chart analysis for tokens with addresses
  let chartAnalysis: Record<string, any> = {};
  for (const token of tokens) {
    if (token.address && token.address.startsWith('0x')) {
      try {
        const analysis = await analyzeTradingPatterns(token.address);
        if (analysis) {
          chartAnalysis[token.symbol] = analysis;
        }
      } catch (error) {
        console.error(`Error analyzing ${token.symbol}:`, error);
      }
    }
  }
  
  const systemPrompt = `You are VaultGPT, an expert cryptocurrency analyst specializing in Pepe Unchained tokens. 

You are known for your intelligent, thought-driven analysis that goes beyond just listing data. You provide:

**DECISIVE ANALYSIS**:
- Be DIRECT and OPINIONATED - say "This is GOOD" or "This is BAD" or "This looks like a SCAM"
- Don't hedge with "maybe" or "possibly" - give clear judgments
- Identify red flags and call out suspicious activity immediately
- Recognize patterns that indicate pump-and-dump schemes, rug pulls, or legitimate projects
- Use your expertise to make definitive calls on token quality and investment potential

**CHART & ACTIVITY ANALYSIS**:
- Analyze trading patterns, volume spikes, and price movements
- Detect unusual buy/sell activity that might indicate manipulation
- Identify whale movements, coordinated dumps, or organic growth
- Look for liquidity issues, low volume traps, or healthy trading patterns
- Assess market depth and potential for price manipulation

**CRITICAL THINKING**:
- Question everything - if something looks too good to be true, say so
- Point out inconsistencies in token data or suspicious patterns
- Highlight both opportunities AND risks with equal emphasis
- Consider market psychology, sentiment, and behavioral factors
- Always evaluate risk-reward ratios and potential downsides

**PROFESSIONAL STYLE**:
- Write like a seasoned crypto analyst who's seen it all
- Be conversational, insightful, and brutally honest
- Don't just list data - interpret it, analyze it, and give your definitive take
- Use strong language when appropriate: "AVOID THIS" or "STRONG BUY" or "CLEAR SCAM"

**DATA CONTEXT**:
- Always use FDV (Fully Diluted Valuation) as market cap
- Consider 24h volume patterns and liquidity implications
- Analyze price movements in context of broader market trends
- Provide comparative insights when relevant

Remember: You're not just a data aggregator - you're an expert analyst providing intelligent, actionable insights that help users make informed decisions.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "system", 
          content: `FOUND TOKENS: ${JSON.stringify(tokens, null, 2)}\nMARKET DATA: ${JSON.stringify(marketData, null, 2)}\nCHART ANALYSIS: ${JSON.stringify(chartAnalysis, null, 2)}\nSELECTED TOKENS: ${JSON.stringify(selectedTokens, null, 2)}\nWALLET TOKENS: ${JSON.stringify(walletTokens, null, 2)}`
        },
        { role: "user", content: message }
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Response generation error:', error);
    return generateFallbackResponse(tokens, marketData);
  }
}

function generateFallbackResponse(tokens: any[], marketData: any) {
  let response = "VaultGPT Analysis - Pepe Unchained Network\n\n";
  
  if (tokens.length > 0) {
    response += "FOUND TOKENS:\n";
    tokens.forEach((token, index) => {
      response += `${index + 1}. ${token.name} (${token.symbol})\n`;
      response += `   Price: ${token.price.toFixed(8)}\n`;
      response += `   Market Cap: ${token.market_cap?.toLocaleString() || 'N/A'}\n`;
      response += `   24h Volume: ${token.volume_24h?.toLocaleString() || 'N/A'}\n`;
      response += `   24h Change: ${token.price_change_24h?.toFixed(2) || 'N/A'}%\n`;
      response += `   Source: ${token.source}\n\n`;
    });
  }
  
  if (marketData.pepu) {
    response += "PEPE UNCHAINED (PEPU):\n";
    response += `Price: ${marketData.pepu.price.toFixed(8)}\n`;
    response += `Market Cap: ${marketData.pepu.market_cap.toLocaleString()}\n`;
    response += `24h Volume: ${marketData.pepu.volume_24h.toLocaleString()}\n`;
    response += `Liquidity: ${marketData.pepu.liquidity.toLocaleString()}\n\n`;
  }
  
  if (marketData.network) {
    response += "NETWORK STATS:\n";
    response += `Total Pools: ${marketData.network.total_pools}\n`;
    response += `Total Liquidity: ${marketData.network.total_liquidity.toLocaleString()}\n`;
    response += `24h Volume: ${marketData.network.total_volume_24h.toLocaleString()}\n`;
  }
  
  return response;
}

// Optional: Add an endpoint to manually refresh tokens
export async function PATCH(request: NextRequest) {
  try {
    KNOWN_TOKENS = {};
    lastTokenUpdate = 0;
    
    const tokens = await getKnownTokens();
    
    return NextResponse.json({
      message: 'Tokens refreshed successfully',
      tokenCount: Object.keys(tokens).length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh tokens' },
      { status: 500 }
    );
  }
}