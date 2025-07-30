'use client';

import { useState, useEffect } from 'react';
import { useBalance, useReadContract, usePublicClient } from 'wagmi';
import { erc20Abi } from 'viem';
import { getLogs } from 'viem/actions';

interface TokenBalance {
  token: string;
  symbol: string;
  amount: string;
  decimals: number;
  usdValue?: number;
  percentage?: number;
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

  const [tokenContracts, setTokenContracts] = useState<TokenContract[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Fetch native token balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address: treasuryData.walletAddress as `0x${string}`,
    chainId: 97741, // PEPU Chain ID
  });

  const publicClient = usePublicClient();

  // Function to scan blockchain for ERC20 tokens held by the wallet
  const scanBlockchainForTokens = async () => {
    if (!publicClient) {
      console.error('Public client not available');
      return;
    }

    setIsLoadingTokens(true);
    try {
      // Get all Transfer events where the wallet is the recipient
      const logs = await publicClient.getLogs({
        address: undefined, // All addresses
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false }
          ]
        },
        args: {
          to: treasuryData.walletAddress as `0x${string}`
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Extract unique token contracts from transfer events
      const uniqueTokens = new Map<string, TokenContract>();
      
      for (const log of logs) {
        const tokenAddress = log.address.toLowerCase();
        
        if (!uniqueTokens.has(tokenAddress)) {
          try {
            // Get token details
            const [symbol, name, decimals] = await Promise.all([
              publicClient.readContract({
                address: log.address,
                abi: erc20Abi,
                functionName: 'symbol'
              }),
              publicClient.readContract({
                address: log.address,
                abi: erc20Abi,
                functionName: 'name'
              }),
              publicClient.readContract({
                address: log.address,
                abi: erc20Abi,
                functionName: 'decimals'
              })
            ]);

            uniqueTokens.set(tokenAddress, {
              address: log.address,
              symbol: symbol as string,
              name: name as string,
              decimals: decimals as number
            });
          } catch (error) {
            console.warn(`Failed to get details for token ${log.address}:`, error);
          }
        }
      }

      setTokenContracts(Array.from(uniqueTokens.values()));
    } catch (error) {
      console.error('Error scanning blockchain for tokens:', error);
      // Fallback to known tokens
      setTokenContracts([
        {
          address: '0x103ea0ca60f7cb79c1b674b1edf103c625c6b589',
          symbol: 'VAULT',
          name: 'Vault Token',
          decimals: 18
        }
      ]);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Scan blockchain for tokens on component mount
  useEffect(() => {
    scanBlockchainForTokens();
  }, []);

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

  // Function to check balance for a specific token
  const checkTokenBalance = async (tokenAddress: string) => {
    if (!publicClient) return '0';
    
    try {
      const balance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [treasuryData.walletAddress as `0x${string}`]
      });
      return balance?.toString() || '0';
    } catch (error) {
      console.warn(`Failed to get balance for token ${tokenAddress}:`, error);
      return '0';
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pepuPrice, setPepuPrice] = useState(0);

  const refreshTreasuryData = async () => {
    setIsRefreshing(true);
    try {
      await scanBlockchainForTokens();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const updateHoldings = async () => {
      if (!nativeLoading && !isLoadingTokens) {
        const holdings: TokenBalance[] = [];
        let totalValue = 0;

        // Get PEPU price for native balance
        const pepuPriceValue = await getPepuPrice();
        setPepuPrice(pepuPriceValue);
        console.log(`PEPU Price: $${pepuPriceValue}`);

        // Add native PEPU balance separately
        if (nativeBalance) {
          const nativeAmount = parseFloat(nativeBalance.formatted);
          const nativeUsdValue = nativeAmount * pepuPriceValue;
          console.log(`PEPU Amount: ${nativeAmount}, USD Value: $${nativeUsdValue}`);
          totalValue += nativeUsdValue;
        }

        // Add ERC20 token balances with real prices
        for (const token of tokenContracts) {
          const balance = await checkTokenBalance(token.address);
          if (balance && parseFloat(balance) > 0) {
            const amount = parseFloat(balance) / Math.pow(10, token.decimals);
            const tokenPrice = await getTokenPrice(token.address);
            const usdValue = amount * tokenPrice;
            
            console.log(`Token: ${token.symbol}, Amount: ${amount}, Price: $${tokenPrice}, USD Value: $${usdValue}`);
            
            holdings.push({
              token: token.name,
              symbol: token.symbol,
              amount: amount.toString(),
              decimals: token.decimals,
              usdValue,
              percentage: 0
            });
            totalValue += usdValue;
          }
        }

        // Calculate percentages for ERC20 tokens only
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
      }
    };

    updateHoldings();
  }, [nativeBalance, nativeLoading, tokenContracts, isLoadingTokens]);

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
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-pepu-dark-green mb-3 md:mb-4">
              Project Wallet & Treasury
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-pepu-dark-green mb-3 md:mb-4">
            Project Wallet & Treasury
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Live data from the official Pepu Vault treasury wallet on PEPU Chain. 
            Transparent allocation strategy with community governance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Wallet Overview */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-pepu-light-green/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-pepu-dark-green">Treasury Holdings</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={refreshTreasuryData}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 bg-pepu-yellow-orange text-pepu-dark-green px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50 text-sm"
                  >
                    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Data</span>
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm md:text-base">Total Treasury Value</span>
                  <span className="text-xl md:text-2xl font-bold text-pepu-dark-green">{formatUSD(treasuryData.totalValue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pepu-light-green to-pepu-yellow-orange h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Native PEPU Balance */}
              {nativeBalance && parseFloat(nativeBalance.formatted) > 0 && (
                <div className="mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg md:text-xl font-bold">Native PEPU Balance</h4>
                      <p className="text-sm opacity-90">Network native token</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-2xl font-bold">{formatTokenAmount(nativeBalance.formatted, nativeBalance.decimals)} PEPU</div>
                      <div className="text-sm opacity-90">{formatUSD(parseFloat(nativeBalance.formatted) * pepuPrice)}</div>
                    </div>
                  </div>
                </div>
              )}

              {treasuryData.holdings.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {treasuryData.holdings.map((holding, index) => {
                  // Find the token contract for this holding
                  const tokenContract = tokenContracts.find(t => t.symbol === holding.symbol);
                  const geckoTerminalUrl = tokenContract ? 
                    `https://www.geckoterminal.com/pepe-unchained/pools/${tokenContract.address}` : 
                    '#';
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{
                          backgroundColor: index === 0 ? '#8BC34A' : 
                                         index === 1 ? '#F4A300' : 
                                         index === 2 ? '#1B4D3E' : 
                                         index === 3 ? '#FF6B6B' : '#9CA3AF'
                        }}></div>
                        <span className="font-semibold text-pepu-dark-green text-sm md:text-base">{holding.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-pepu-dark-green text-sm md:text-base">
                          {formatTokenAmount(holding.amount, holding.decimals)} {holding.symbol}
                        </div>
                        {holding.usdValue && (
                          <div className="text-xs md:text-sm text-gray-500">
                            <a 
                              href={geckoTerminalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pepu-yellow-orange hover:underline"
                            >
                              {formatUSD(holding.usdValue)}
                            </a>
                          </div>
                        )}
                        {holding.percentage && (
                          <div className="text-xs text-gray-400">{holding.percentage.toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No token holdings found</p>
                </div>
              )}

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-pepu-light-green/10 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs md:text-sm text-gray-600">Wallet Address</span>
                  <a 
                    href="https://pepuscan.com/address/0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pepu-yellow-orange hover:underline font-mono text-xs md:text-sm"
                  >
                    {formatAddress(treasuryData.walletAddress)}
                  </a>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <a 
                    href="https://pepuscan.com/address/0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E?tab=tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pepu-yellow-orange hover:underline"
                  >
                    View all token balances on PepuScan →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Treasury Strategy */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-pepu-light-green/20">
              <h3 className="text-lg md:text-xl font-bold text-pepu-dark-green mb-3 md:mb-4">Wallet Info</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Native PEPU</span>
                  <span className="font-bold text-pepu-dark-green text-sm md:text-base">
                    {formatTokenAmount(treasuryData.nativeBalance, 18)} PEPU
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">ERC20 Tokens</span>
                  <span className="font-bold text-pepu-yellow-orange text-sm md:text-base">
                    {treasuryData.holdings.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Total Value</span>
                  <span className="font-bold text-pepu-dark-green text-sm md:text-base">
                    {formatUSD(treasuryData.totalValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Network</span>
                  <span className="font-bold text-pepu-dark-green text-sm md:text-base">
                    PEPU Chain
                  </span>
                </div>
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <h4 className="font-semibold text-pepu-dark-green mb-2 text-sm md:text-base">Live Data</h4>
                <p className="text-xs md:text-sm text-gray-600">
                  Real-time token balances fetched directly from the blockchain. 
                  Click the wallet address to view on PepuScan explorer.
                </p>
              </div>
            </div>

            {/* Explorer Link */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-pepu-light-green/20">
              <h3 className="text-lg md:text-xl font-bold text-pepu-dark-green mb-3 md:mb-4">Block Explorer</h3>
              
              <div className="space-y-3">
                <a 
                  href="https://pepuscan.com/address/0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-pepu-yellow-orange/10 rounded-lg hover:bg-pepu-yellow-orange/20 transition-colors"
                >
                    <div>
                    <div className="font-semibold text-pepu-dark-green text-sm md:text-base">View on PepuScan</div>
                    <div className="text-xs md:text-sm text-gray-600">Full transaction history</div>
                  </div>
                  <svg className="w-5 h-5 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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