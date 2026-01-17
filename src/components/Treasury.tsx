'use client';

import { useState, useEffect } from 'react';
import { useBalance } from 'wagmi';

interface TokenBalance {
  token: string;
  symbol: string;
  amount: string;
  decimals: number;
  usdValue?: number;
  percentage?: number;
  address?: string; // Add address for token links
}

interface TreasuryData {
  walletAddress: string;
  nativeBalance: string;
  totalValue: number;
  holdings: TokenBalance[];
  isLoading: boolean;
  error?: string;
}

interface TokenContract {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}



export default function Treasury() {
  const [treasuryData, setTreasuryData] = useState<TreasuryData>({
    walletAddress: '0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E',
    nativeBalance: '0',
    totalValue: 0,
    holdings: [],
    isLoading: true
  });

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter holdings based on search term
  const filteredHoldings = treasuryData.holdings.filter(holding =>
    holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holding.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch native token balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address: treasuryData.walletAddress as `0x${string}`,
    chainId: 97741, // PEPU Chain ID
  });

  // Function to get PEPU price from API
  const getPepuPrice = async () => {
    try {
      const response = await fetch('/api/pepu-price');
      if (!response.ok) {
        throw new Error('Failed to fetch PEPU price');
      }
      const data = await response.json();
      return data.price || 0;
    } catch (error) {
      console.warn('Failed to get PEPU price:', error);
      return 0;
    }
  };

  // Function to get token price from API
  const getTokenPrice = async (tokenAddress: string) => {
    try {
      const response = await fetch(`/api/token-price?address=${tokenAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token price');
      }
      const data = await response.json();
      return data.price || 0;
    } catch (error) {
      console.warn(`Failed to get price for token ${tokenAddress}:`, error);
      return 0;
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pepuPrice, setPepuPrice] = useState(0);

  // Fetch token balances from API
  const fetchTokenBalances = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/token-balances?address=${treasuryData.walletAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token balances');
      }
      const data = await response.json();
      return data.balances || [];
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const refreshTreasuryData = async () => {
    setIsRefreshing(true);
    try {
      await fetchTokenBalances();
      // Trigger updateHoldings by updating a dependency
      setTreasuryData(prev => ({ ...prev }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const updateHoldings = async () => {
      if (nativeLoading) return;

      setIsLoadingTokens(true);
      const holdings: TokenBalance[] = [];
      let totalValue = 0;

      try {
        // Get PEPU price for native balance
        const pepuPriceValue = await getPepuPrice();
        setPepuPrice(pepuPriceValue);
        console.log(`PEPU Price: $${pepuPriceValue}`);

        // Add native PEPU balance separately
        if (nativeBalance && parseFloat(nativeBalance.formatted) > 0) {
          const nativeAmount = parseFloat(nativeBalance.formatted);
          const nativeUsdValue = nativeAmount * pepuPriceValue;
          console.log(`PEPU Amount: ${nativeAmount}, USD Value: $${nativeUsdValue}`);
          totalValue += nativeUsdValue;
          
          // Add native balance to holdings for display
          holdings.push({
            token: 'Pepe Unchained V2',
            symbol: 'PEPU',
            amount: nativeAmount.toString(),
            decimals: nativeBalance.decimals,
            usdValue: nativeUsdValue,
            percentage: 0
          });
        }

        // Fetch ERC20 token balances from API
        const tokenBalances = await fetchTokenBalances();
        console.log(`Processing ${tokenBalances.length} token balances`);
        
        // Process all token balances - fetch prices in parallel for better performance
        const pricePromises = tokenBalances.map(async (tokenBalance) => {
          try {
            const rawBalance = BigInt(tokenBalance.rawBalance || '0');
            const amount = Number(rawBalance) / Math.pow(10, tokenBalance.decimals);
            
            if (amount > 0) {
              let tokenPrice = 0;
              try {
                tokenPrice = await getTokenPrice(tokenBalance.address);
              } catch (error) {
                console.warn(`Failed to get price for ${tokenBalance.symbol}:`, error);
                tokenPrice = 0;
              }
              const usdValue = amount * tokenPrice;
              
              console.log(`Token: ${tokenBalance.symbol}, Amount: ${amount}, Price: $${tokenPrice}, USD Value: $${usdValue}`);
              
              return {
                token: tokenBalance.name,
                symbol: tokenBalance.symbol,
                amount: amount.toString(),
                decimals: tokenBalance.decimals,
                usdValue: usdValue || 0,
                percentage: 0,
                address: tokenBalance.address
              };
            }
            return null;
          } catch (error) {
            console.error(`Error processing token ${tokenBalance.symbol}:`, error);
            return null;
          }
        });

        // Wait for all price fetches to complete
        const tokenHoldings = await Promise.all(pricePromises);
        
        // Filter out nulls and add to holdings
        for (const holding of tokenHoldings) {
          if (holding) {
            holdings.push(holding);
            totalValue += holding.usdValue || 0;
          }
        }

        // Calculate percentages
        holdings.forEach(holding => {
          if (holding.usdValue && totalValue > 0) {
            holding.percentage = (holding.usdValue / totalValue) * 100;
          }
        });

        setTreasuryData({
          walletAddress: '0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E',
          nativeBalance: nativeBalance?.formatted || '0',
          totalValue,
          holdings,
          isLoading: false
        });
      } catch (error) {
        console.error('Error updating holdings:', error);
        setTreasuryData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load token balances'
        }));
      }
    };

    updateHoldings();
  }, [nativeBalance, nativeLoading]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTokenAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  if (treasuryData.isLoading || isLoadingTokens) {
    return (
      <section id="treasury" className="py-8 md:py-16 bg-gradient-to-br from-pepu-white to-pepu-light-green/5">
        <div className="w-full px-4 sm:max-w-7xl sm:mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
              Project Wallet & Treasury
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Loading live data from the official Pepu Vault treasury wallet...
              {isLoadingTokens && <br />}
              {isLoadingTokens && <span className="text-sm">Scanning blockchain for ERC20 tokens...</span>}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepu-dark-green"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="treasury" className="py-8 md:py-16 bg-gradient-to-br from-pepu-white to-pepu-light-green/5">
                  <div className="w-full px-0 md:max-w-7xl md:mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
            Project Wallet & Treasury
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Live data from the official Pepu Vault treasury wallet on PEPU Chain. 
            Transparent allocation strategy with community governance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Wallet Overview */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-primary">Treasury Holdings</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={refreshTreasuryData}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 bg-pepu-yellow-orange text-primary px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50 text-sm"
                  >
                    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live Data</span>
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm md:text-base">Total Treasury Value</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">{formatUSD(treasuryData.totalValue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pepu-light-green to-pepu-yellow-orange h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search holdings (vault)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-dark-green focus:border-transparent text-sm bg-card text-black placeholder-gray-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {treasuryData.holdings.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                {filteredHoldings.map((holding, index) => {
                  // Find the token address from holdings (we'll need to store it)
                  // For now, we'll construct the URL based on symbol or use a default
                  let geckoTerminalUrl = '#';
                  if (holding.symbol === 'PEPU') {
                    // Native PEPU token - use the USDT/WPEPU pool
                    geckoTerminalUrl = 'https://www.geckoterminal.com/pepe-unchained/pools/0x4be3af53800aade09201654cd76d55063c7bde70';
                  } else if (holding.address) {
                    // ERC20 token - use the token address
                    geckoTerminalUrl = `https://www.geckoterminal.com/pepe-unchained/tokens/${holding.address}`;
                  }
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${
                      holding.symbol === 'PEPU' ? 'bg-gradient-to-r from-pepu-dark-green to-pepu-light-green text-white' : 'bg-secondary hover:bg-secondary/80 transition-colors'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{
                          backgroundColor: holding.symbol === 'PEPU' ? '#FFFFFF' :
                                         index === 0 ? '#8BC34A' : 
                                         index === 1 ? '#F4A300' : 
                                         index === 2 ? '#1B4D3E' : 
                                         index === 3 ? '#FF6B6B' : '#9CA3AF'
                        }}></div>
                        <span className={`font-semibold text-sm ${
                          holding.symbol === 'PEPU' ? 'text-white' : 'text-primary'
                        }`}>
                          {holding.symbol}
                          {holding.symbol === 'PEPU' && <span className="text-xs opacity-90 ml-1">(Native)</span>}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${
                          holding.symbol === 'PEPU' ? 'text-white' : 'text-primary'
                        }`}>
                          {formatTokenAmount(holding.amount, holding.decimals)} {holding.symbol}
                        </div>
                        <div className={`text-xs ${
                          holding.symbol === 'PEPU' ? 'text-white opacity-90' : 'text-muted-foreground'
                        }`}>
                          {holding.usdValue !== undefined && holding.usdValue > 0 ? (
                            <a 
                              href={geckoTerminalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`hover:underline ${
                                holding.symbol === 'PEPU' ? 'text-white' : 'text-pepu-yellow-orange'
                              }`}
                            >
                              {formatUSD(holding.usdValue)}
                            </a>
                          ) : (
                            <span className={holding.symbol === 'PEPU' ? 'text-white opacity-75' : 'text-muted-foreground'}>
                              Price unavailable
                            </span>
                          )}
                        </div>
                        {holding.percentage && (
                          <div className={`text-xs ${
                            holding.symbol === 'PEPU' ? 'text-white opacity-75' : 'text-muted-foreground'
                          }`}>{holding.percentage.toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredHoldings.length === 0 && searchTerm && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">No tokens found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No token holdings found</p>
                </div>
              )}
            </div>
          </div>

          {/* Treasury Strategy */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card rounded-2xl shadow-xl p-4 md:p-6 border border-border">
              <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">Wallet Info</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm md:text-base">Native PEPU</span>
                  <span className="font-bold text-primary text-sm md:text-base">
                    {formatTokenAmount(treasuryData.nativeBalance, 18)} PEPU
                  </span>
                </div>

                                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground text-sm md:text-base">ERC20 Tokens</span>
                   <span className="font-bold text-pepu-yellow-orange text-sm md:text-base">
                     {treasuryData.holdings.filter(holding => holding.symbol !== 'PEPU').length}
                   </span>
                 </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm md:text-base">Total Value</span>
                  <span className="font-bold text-primary text-sm md:text-base">
                    {formatUSD(treasuryData.totalValue)}
                  </span>
                </div>

                                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground text-sm md:text-base">Network</span>
                   <span className="font-bold text-primary text-sm md:text-base">
                     Pepe Unchained
                   </span>
                 </div>
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2 text-sm md:text-base">Live Data</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Real-time token balances fetched directly from the blockchain. 
                  Click the wallet address to view on PepuScan explorer.
                </p>
              </div>
            </div>

            {/* Explorer Link */}
            <div className="bg-card rounded-2xl shadow-xl p-4 md:p-6 border border-border">
              <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">Block Explorer</h3>
              
              <div className="space-y-3">
                <a 
                  href="https://pepuscan.com/address/0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-pepu-yellow-orange/10 rounded-lg hover:bg-pepu-yellow-orange/20 transition-colors"
                >
                    <div>
                    <div className="font-semibold text-primary text-sm md:text-base">View on PepuScan</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Full transaction history</div>
                  </div>
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}