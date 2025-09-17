'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { erc20Abi } from 'viem';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tokenData?: any;
}

interface WalletToken {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue?: number;
}

interface VaultGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Improved Token Card Component
const TokenCard = ({ token }: { token: any }) => {
  const formatNumber = (num: any): string => {
    if (!num || num === 0 || num === null || num === undefined) return 'N/A';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return 'N/A';
    
    if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(1)}M`;
    if (numValue >= 1e3) return `$${(numValue / 1e3).toFixed(1)}K`;
    return `$${numValue.toLocaleString()}`;
  };

  const formatPrice = (price: any): string => {
    if (!price || price === 0 || price === null || price === undefined) return 'N/A';
    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceValue)) return 'N/A';
    
    if (priceValue < 0.000001) return `$${priceValue.toExponential(3)}`;
    if (priceValue < 0.01) return `$${priceValue.toFixed(8)}`;
    return `$${priceValue.toFixed(6)}`;
  };

  const formatPercentage = (change: any): string | null => {
    if (!change || change === 0 || change === null || change === undefined) return null;
    const changeValue = typeof change === 'string' ? parseFloat(change) : change;
    if (isNaN(changeValue)) return null;
    return `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`;
  };

  const priceChange = formatPercentage(token.price_change_24h);
  const hasValidData = token.price > 0 || token.market_cap > 0 || token.volume_24h > 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 mb-2">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-blue-900 text-sm">{token.name || 'Unknown Token'}</h4>
          <p className="text-blue-700 text-xs">{token.symbol || 'N/A'}</p>
          {token.source && (
            <p className="text-xs text-muted-foreground">Source: {token.source}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600 text-sm">{formatPrice(token.price)}</p>
          {priceChange && (
            <p className={`text-xs ${token.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange}
            </p>
          )}
        </div>
      </div>
      
      {hasValidData && (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Market Cap:</span>
            <br />
            <span className="text-foreground">{formatNumber(token.market_cap)}</span>
          </div>
          <div>
            <span className="font-medium">24h Volume:</span>
            <br />
            <span className="text-foreground">{formatNumber(token.volume_24h)}</span>
          </div>
        </div>
      )}
      
      {token.liquidity && token.liquidity > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">Liquidity:</span>
          <span className="text-foreground ml-1">{formatNumber(token.liquidity)}</span>
        </div>
      )}
      
      {token.address && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">Address:</span>
          <span className="ml-1 font-mono break-all">{token.address}</span>
        </div>
      )}
    </div>
  );
};

// Market Stats Component
const MarketStats = ({ stats }: { stats: any }) => (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-2">
    <h4 className="font-bold text-purple-900 mb-2">Network Overview</h4>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="text-purple-700">
        <span className="font-medium">Total Pools:</span>
        <br />{stats.total_pools || 'N/A'}
      </div>
      <div className="text-purple-700">
        <span className="font-medium">Total Liquidity:</span>
        <br />${stats.total_liquidity?.toLocaleString() || 'N/A'}
      </div>
    </div>
  </div>
);

export default function VaultGPTModal({ isOpen, onClose }: VaultGPTModalProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [showWalletTokens, setShowWalletTokens] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<WalletToken[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const VAULT_TOKEN_ADDRESS = '0x8746D6Fc80708775461226657a6947497764BBe6';
  const MINIMUM_VAULT_BALANCE = 0; // No tokens required

  // Get native PEPU balance (like Treasury component)
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
    chainId: 97741, // PEPU Chain ID
  });

  useEffect(() => {
    if (isConnected && address) {
      // Always allow access when connected (MINIMUM_VAULT_BALANCE = 0)
      setHasAccess(true);
    } else if (!isConnected || !address) {
      setHasAccess(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHasAccess(false);
      setMessages([]);
      setInputMessage('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Scan wallet for tokens using same approach as Treasury
  const scanWalletTokens = async () => {
    if (!address || !publicClient) {
      console.log('Missing address or publicClient:', { address, publicClient });
      return;
    }
    
    console.log('Starting token scan for address:', address);
    setIsLoadingTokens(true);
    try {
      const tokens: WalletToken[] = [];
      
      // First, add native PEPU balance if exists
      if (nativeBalance && parseFloat(nativeBalance.formatted) > 0) {
        const pepuAmount = parseFloat(nativeBalance.formatted);
        console.log('PEPU balance:', pepuAmount);
        
        // Get PEPU price
        try {
          const priceResponse = await fetch('/api/pepu-price');
          const priceData = await priceResponse.json();
          const usdValue = pepuAmount * (priceData.price || 0);

          tokens.push({
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'PEPU',
            name: 'Pepe Unchained',
            balance: pepuAmount.toString(),
            decimals: 18,
            usdValue
          });
          
          console.log('Added PEPU to wallet tokens');
        } catch (priceError) {
          console.error('Error fetching PEPU price:', priceError);
          tokens.push({
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'PEPU',
            name: 'Pepe Unchained',
            balance: pepuAmount.toString(),
            decimals: 18,
            usdValue: 0
          });
        }
      }
      
      // Now scan for ERC20 tokens using getLogs (same as Treasury)
      try {
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
            to: address as `0x${string}`
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        });

        console.log(`Found ${logs.length} transfer events`);

        // Extract unique token contracts from transfer events
        const uniqueTokens = new Map<string, { address: string; symbol: string; name: string; decimals: number }>();
        
        for (const log of logs) {
          const tokenAddress = log.address.toLowerCase();
          
          if (!uniqueTokens.has(tokenAddress)) {
            try {
              // Get token details using erc20Abi
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

        console.log(`Found ${uniqueTokens.size} unique tokens`);

        // Check balance for each token
        for (const tokenInfo of uniqueTokens.values()) {
          try {
            const balance = await publicClient.readContract({
              address: tokenInfo.address as `0x${string}`,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address as `0x${string}`]
            });

            const balanceFormatted = (Number(balance) / Math.pow(10, tokenInfo.decimals)).toString();
            console.log(`${tokenInfo.symbol} balance:`, balanceFormatted);
            
            if (Number(balanceFormatted) > 0) {
              // Get token price
              try {
                const priceResponse = await fetch(`/api/token-price?address=${tokenInfo.address}`);
                const priceData = await priceResponse.json();
                const usdValue = Number(balanceFormatted) * (priceData.price || 0);

                tokens.push({
                  address: tokenInfo.address,
                  symbol: tokenInfo.symbol,
                  name: tokenInfo.name,
                  balance: balanceFormatted,
                  decimals: tokenInfo.decimals,
                  usdValue
                });
                
                console.log(`Added ${tokenInfo.symbol} to wallet tokens`);
              } catch (priceError) {
                console.error(`Error fetching price for ${tokenInfo.symbol}:`, priceError);
                // Add token without price
                tokens.push({
                  address: tokenInfo.address,
                  symbol: tokenInfo.symbol,
                  name: tokenInfo.name,
                  balance: balanceFormatted,
                  decimals: tokenInfo.decimals,
                  usdValue: 0
                });
              }
            }
          } catch (error) {
            console.error(`Error checking balance for ${tokenInfo.symbol}:`, error);
          }
        }
      } catch (error) {
        console.error('Error scanning for ERC20 tokens:', error);
      }

      // Sort tokens by USD value (highest first)
      tokens.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
      
      setWalletTokens(tokens);
      console.log(`Found ${tokens.length} tokens with balance > 0:`, tokens);
      
      if (tokens.length === 0) {
        console.log('No tokens found. This could mean:');
        console.log('1. Wallet has no PEPU or ERC20 tokens');
        console.log('2. Wallet is on wrong network (should be Pepe Unchained)');
        console.log('3. RPC connection issues');
        console.log('4. Token contracts not responding');
      }
    } catch (error) {
      console.error('Error scanning wallet tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  useEffect(() => {
    if (isOpen && hasAccess) {
      setMessages([{
        id: '1',
        text: 'Hello! I\'m VaultGPT, your AI assistant for Pepe Unchained analytics. I can analyze tokens, show market trends, and provide insights. Try asking:\n\n• "Tell me about PENK"\n• "Show trending tokens"\n• "Compare VAULT and SPRING"',
        sender: 'ai',
        timestamp: new Date()
      }]);
      
      // Scan wallet tokens when modal opens
      scanWalletTokens();
    }
  }, [isOpen, hasAccess, address, publicClient, nativeBalance]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseResponseForVisuals = (responseText: string, apiData: any) => {
    const cleanText = responseText
      .replace(/\*\*/g, '')
      .replace(/###\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/^\s*[-•]\s*/gm, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    let tokenData = null;
    let marketData = null;

    console.log('Full API Response:', apiData);

    if (apiData?.tokens && Array.isArray(apiData.tokens) && apiData.tokens.length > 0) {
      // Remove duplicates based on address
      const uniqueTokens = new Map();
      apiData.tokens.forEach((token: any) => {
        const address = token.address || '';
        if (address && !uniqueTokens.has(address)) {
          uniqueTokens.set(address, {
        name: token.name || 'Unknown Token',
        symbol: token.symbol || 'N/A',
        price: token.price || 0,
        market_cap: token.market_cap || null,
        volume_24h: token.volume_24h || null,
        price_change_24h: token.price_change_24h || null,
        liquidity: token.liquidity || null,
            address: address,
        source: token.source || 'unknown'
          });
        }
      });
      tokenData = Array.from(uniqueTokens.values());
    }

    if (!tokenData && responseText) {
      try {
        const priceMatches = responseText.match(/\$[\d,]+\.?\d*/g);
        const marketCapMatches = responseText.match(/market\s+cap[^$]*\$[\d,]+\.?\d*/gi);
        const volumeMatches = responseText.match(/volume[^$]*\$[\d,]+\.?\d*/gi);
        const tokenNameMatch = responseText.match(/(MatrixFrog|YASHIX|[A-Z][a-zA-Z]+)\s*\(([A-Z]{2,10})\)/i);
        
        if (tokenNameMatch || priceMatches) {
          const extractedPrice = priceMatches?.[0]?.replace('$', '').replace(',', '') || '0';
          const extractedMarketCap = marketCapMatches?.[0]?.match(/\$[\d,]+\.?\d*/)?.[0]?.replace('$', '').replace(',', '') || null;
          const extractedVolume = volumeMatches?.[0]?.match(/\$[\d,]+\.?\d*/)?.[0]?.replace('$', '').replace(',', '') || null;
          
          tokenData = [{
            name: tokenNameMatch?.[1] || 'Unknown Token',
            symbol: tokenNameMatch?.[2] || 'N/A',
            price: parseFloat(extractedPrice) || 0,
            market_cap: extractedMarketCap ? parseFloat(extractedMarketCap) : null,
            volume_24h: extractedVolume ? parseFloat(extractedVolume) : null,
            price_change_24h: null,
            liquidity: null,
            address: '',
            source: 'text_extraction'
          }];
        }
      } catch (error) {
        console.error('Error extracting token data:', error);
      }
    }

    if (apiData?.network) {
      marketData = apiData.network;
    }

    console.log('Parsed Token Data:', tokenData);
    console.log('Parsed Market Data:', marketData);

    return { cleanText, tokenData, marketData };
  };

  // Function to lookup presale data for a token address
  const lookupPresaleData = async (address: string) => {
    try {
      const response = await fetch('https://pepu-mainnet2-pumppad.0sum.io/subgraphs/name/launchpad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { 
            presales(where: { token: "${address.toLowerCase()}" }) { 
              token 
              data 
              isEnd 
              createdAt
              updatedAt
            } 
          }`,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch presale data');
      const json = await response.json();
      const presales = json?.data?.presales || [];
      
      if (presales.length > 0) {
        const presale = presales[0];
        let data: any = {};
        try {
          data = JSON.parse(presale.data || '{}');
        } catch (e) {
          console.warn('Failed to parse presale data:', e);
        }

        return {
          found: true,
          data: {
            token: presale.token,
            isEnd: presale.isEnd,
            createdAt: presale.createdAt,
            updatedAt: presale.updatedAt,
            name: data.name || 'Unknown',
            symbol: data.symbol || 'UNKNOWN',
            description: data.description || '',
            iconUrl: data.iconUrl || '',
            website: data.website || '',
            twitter: data.twitter || '',
            telegram: data.telegram || '',
            totalSupply: data.totalSupply || '0',
            decimals: data.decimals || 18
          }
        };
      }

      return { found: false };
    } catch (error) {
      console.error('Error fetching presale data:', error);
      return { found: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Function to validate if an address is on Pepe Unchained network
  const validateTokenAddress = async (address: string): Promise<{ isValid: boolean; tokenInfo?: any; presaleInfo?: any; error?: string }> => {
    // Clean the address - remove any extra characters that might have been pasted
    const cleanAddress = address.trim().replace(/[^0-9a-fA-Fx]/g, '');
    
    if (!cleanAddress || cleanAddress.length !== 42 || !cleanAddress.startsWith('0x')) {
      return { isValid: false, error: 'Invalid address format' };
    }

    try {
      // First check presale data
      const presaleData = await lookupPresaleData(cleanAddress);
      if (presaleData.found && presaleData.data) {
        return {
          isValid: true,
          presaleInfo: presaleData.data,
          tokenInfo: {
            address: cleanAddress.toLowerCase(),
            symbol: presaleData.data?.symbol || 'UNKNOWN',
            name: presaleData.data?.name || 'Unknown',
            decimals: presaleData.data?.decimals || 18
          }
        };
      }

      // If not in presale, check if it's a valid contract
      const code = await publicClient?.getBytecode({ address: cleanAddress as `0x${string}` });
      if (!code || code === '0x') {
        return { isValid: false, error: 'Not a contract address or presale token' };
      }

      // Try to get token metadata from contract
      try {
        const [symbol, name, decimals] = await Promise.all([
          publicClient?.readContract({ 
            address: cleanAddress as `0x${string}`, 
            abi: erc20Abi, 
            functionName: 'symbol' 
          }),
          publicClient?.readContract({ 
            address: cleanAddress as `0x${string}`, 
            abi: erc20Abi, 
            functionName: 'name' 
          }),
          publicClient?.readContract({ 
            address: cleanAddress as `0x${string}`, 
            abi: erc20Abi, 
            functionName: 'decimals' 
          })
        ]);

        return {
          isValid: true,
          tokenInfo: {
            address: cleanAddress.toLowerCase(),
            symbol: symbol as string,
            name: name as string,
            decimals: decimals as number
          }
        };
      } catch (error) {
        return { isValid: false, error: 'Not a valid ERC20 token' };
      }
    } catch (error) {
      return { isValid: false, error: 'Network validation failed' };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !hasAccess) return;

    // Check for comparison requests (e.g., "compare X and Y", "X vs Y")
    const comparisonMatch = inputMessage.match(/(?:compare|vs|versus)\s+([A-Za-z0-9]+)\s+(?:and|vs|versus)\s+([A-Za-z0-9]+)/i);
    if (comparisonMatch) {
      const [, token1, token2] = comparisonMatch;
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      // Find tokens in wallet or create comparison request
      const token1Data = walletTokens.find(t => 
        t.symbol.toLowerCase() === token1.toLowerCase() || 
        t.name.toLowerCase().includes(token1.toLowerCase())
      );
      const token2Data = walletTokens.find(t => 
        t.symbol.toLowerCase() === token2.toLowerCase() || 
        t.name.toLowerCase().includes(token2.toLowerCase())
      );

      const contextMessage = `Compare ${token1} and ${token2}. ${token1Data ? `Token 1 (${token1}) is in wallet: ${JSON.stringify(token1Data)}` : `Token 1 (${token1}) not in wallet`}. ${token2Data ? `Token 2 (${token2}) is in wallet: ${JSON.stringify(token2Data)}` : `Token 2 (${token2}) not in wallet`}.`;

      // Create abort controller for comparison request
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const response = await fetch('/api/vaultgpt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        body: JSON.stringify({
          message: contextMessage,
          selectedToken: null, // No single token selected for comparison
          walletTokens: walletTokens.map(token => ({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            usdValue: token.usdValue
          })),
          walletAddress: address
        }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'No response received',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Error sending comparison message:', error);
        
        // Check if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Comparison request was cancelled by user');
          return; // Don't add error message for cancelled requests
        }
        
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error while processing your comparison request. Please try again.',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
        setAbortController(null); // Clear abort controller
      }
      return;
    }

    // Check if user pasted token addresses (single or multiple)
    const addressMatches = inputMessage.match(/0x[a-fA-F0-9]{40}/g);
    if (addressMatches && addressMatches.length > 0) {
      const addresses = addressMatches;
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `Looking up token addresses: ${addresses.join(', ')}`,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      const validatedTokens: WalletToken[] = [];
      const errors: string[] = [];

      // Process all addresses
      for (const address of addresses) {
        const validation = await validateTokenAddress(address);
        if (!validation.isValid) {
          errors.push(`❌ ${address}: ${validation.error}`);
          continue;
        }

        // If valid, add to wallet tokens
        if (validation.tokenInfo) {
          const newToken: WalletToken = {
            address: validation.tokenInfo.address,
            symbol: validation.tokenInfo.symbol,
            name: validation.tokenInfo.name,
            balance: '0', // Will be updated when we get balance
            decimals: validation.tokenInfo.decimals,
            usdValue: 0
          };

          // Add to wallet tokens if not already present
          setWalletTokens(prev => {
            const exists = prev.some(t => t.address.toLowerCase() === newToken.address.toLowerCase());
            if (!exists) {
              return [...prev, newToken];
            }
            return prev;
          });

          validatedTokens.push(newToken);
        }
      }

      // Show results
      let responseText = '';
      if (validatedTokens.length > 0) {
        responseText += `✅ Found ${validatedTokens.length} valid token(s):\n\n`;
        validatedTokens.forEach((token, index) => {
          responseText += `${index + 1}. ${token.symbol} (${token.name})\n`;
          responseText += `   Address: ${token.address}\n\n`;
        });

        // Select ALL tokens for comparison mode
        setSelectedTokens(validatedTokens);

        // If multiple tokens, suggest comparison
        if (validatedTokens.length > 1) {
          responseText += `💡 ${validatedTokens.length} tokens selected for comparison! You can now ask:\n`;
          responseText += `• "Which is more volatile?"\n`;
          responseText += `• "Compare their performance"\n`;
          responseText += `• "Which has better liquidity?"\n`;
          responseText += `• "Analyze all tokens"\n\n`;
        } else {
          responseText += `💡 Token selected! You can now ask questions about ${validatedTokens[0].symbol}.\n\n`;
        }
      }

      if (errors.length > 0) {
        responseText += `\n${errors.join('\n')}`;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      return;
    }

    // Create context-aware message
    let contextMessage = inputMessage;
    if (selectedTokens.length > 0) {
      if (selectedTokens.length === 1) {
        const token = selectedTokens[0];
        contextMessage = `Token Context: ${token.symbol} (${token.address}) - ${token.name}\nBalance: ${token.balance} ${token.symbol}\n\nUser Question: ${inputMessage}`;
      } else {
        // Multiple tokens selected - comparison mode
        const tokenContexts = selectedTokens.map(token => 
          `${token.symbol} (${token.address}) - ${token.name}\nBalance: ${token.balance} ${token.symbol}`
        ).join('\n\n');
        
        contextMessage = `COMPARISON MODE - Multiple Tokens Selected:\n\n${tokenContexts}\n\nUser Question: ${inputMessage}`;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/vaultgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: contextMessage,
          selectedTokens: selectedTokens.map(token => ({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            usdValue: token.usdValue
          })),
          walletTokens: walletTokens.map(token => ({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            usdValue: token.usdValue
          })),
          walletAddress: address
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { cleanText, tokenData, marketData } = parseResponseForVisuals(data.response, data);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: cleanText,
          sender: 'ai',
          timestamp: new Date(),
          tokenData: { tokens: tokenData, market: marketData }
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble analyzing that right now. Please try asking about specific Pepe Unchained tokens or market data.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled by user');
        return; // Don't add error message for cancelled requests
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm experiencing technical difficulties. Please try again or ask about Pepe Unchained analytics.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
      setAbortController(null); // Clear abort controller
    }
  };

  const handleStopRequest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectToken = (token: WalletToken) => {
    setSelectedTokens([token]);
    setShowWalletTokens(false);
    // Auto-focus on input
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  const addTokenToSelection = (token: WalletToken) => {
    setSelectedTokens(prev => {
      const exists = prev.some(t => t.address.toLowerCase() === token.address.toLowerCase());
      if (!exists) {
        return [...prev, token];
      }
      return prev;
    });
  };

  const removeTokenFromSelection = (tokenAddress: string) => {
    setSelectedTokens(prev => prev.filter(t => t.address.toLowerCase() !== tokenAddress.toLowerCase()));
  };

  const clearSelectedTokens = () => {
    setSelectedTokens([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-pepu-dark-green">VaultGPT</h2>
              <p className="text-xs text-muted-foreground">AI Analytics Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-muted-foreground transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Your Wallet</h3>
                <p className="text-base text-muted-foreground mb-4">Connect your wallet to access VaultGPT analytics</p>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="bg-pepu-yellow-orange text-pepu-dark-green px-6 py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors text-base"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${message.sender === 'user' ? '' : 'w-full'}`}>
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-pepu-yellow-orange text-pepu-dark-green ml-auto max-w-md'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="text-xs leading-relaxed whitespace-pre-line">{message.text}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {message.sender === 'ai' && message.tokenData && (
                        <div className="mt-3 space-y-2">
                          {message.tokenData.tokens?.map((token: any, index: number) => (
                            <TokenCard key={index} token={token} />
                          ))}
                          
                          {message.tokenData.market && (
                            <MarketStats stats={message.tokenData.market} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-foreground px-4 py-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex-shrink-0 p-4 border-t border-border">
                {/* Wallet Tokens Section */}
                {isLoadingTokens ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-center p-3 bg-secondary rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-pepu-yellow-orange rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-pepu-yellow-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-4 h-4 bg-pepu-yellow-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-pepu-dark-green ml-2">Scanning your tokens...</span>
                      </div>
                    </div>
                  </div>
                ) : walletTokens.length > 0 ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-pepu-dark-green">Your Tokens</h4>
                      <button
                        onClick={() => setShowWalletTokens(!showWalletTokens)}
                        className="text-xs text-pepu-yellow-orange hover:underline"
                      >
                        {showWalletTokens ? 'Hide' : 'Show'} ({walletTokens.length})
                      </button>
                    </div>
                    
                    {showWalletTokens && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <div className="text-xs text-muted-foreground">
                            💡 Click tokens to select multiple for comparison
                          </div>
                          {walletTokens.length > 1 && (
                            <button
                              onClick={() => {
                                const allSelected = walletTokens.every(token => 
                                  selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())
                                );
                                if (allSelected) {
                                  // Deselect all wallet tokens
                                  setSelectedTokens(prev => prev.filter(token => 
                                    !walletTokens.some(wt => wt.address.toLowerCase() === token.address.toLowerCase())
                                  ));
                                } else {
                                  // Select all wallet tokens
                                  const newSelections = walletTokens.filter(token => 
                                    !selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())
                                  );
                                  setSelectedTokens(prev => [...prev, ...newSelections]);
                                }
                              }}
                              className="text-xs text-pepu-dark-green hover:text-pepu-yellow-orange font-medium"
                            >
                              {walletTokens.every(token => 
                                selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())
                              ) ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                        {walletTokens.map((token, index) => {
                          const isSelected = selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase());
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                if (isSelected) {
                                  removeTokenFromSelection(token.address);
                                } else {
                                  addTokenToSelection(token);
                                }
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-pepu-light-green/30 border border-pepu-dark-green' 
                                  : 'bg-secondary hover:bg-secondary/80'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isSelected ? 'bg-pepu-dark-green' : 'bg-pepu-yellow-orange'
                                }`}>
                                  <span className={`text-xs font-bold ${
                                    isSelected ? 'text-white' : 'text-pepu-dark-green'
                                  }`}>
                                    {isSelected ? '✓' : token.symbol.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-pepu-dark-green">{token.symbol}</div>
                                  <div className="text-xs text-muted-foreground">{token.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-pepu-dark-green">
                                  {Number(token.balance).toLocaleString()}
                                </div>
                                {token.usdValue && token.usdValue > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    ${token.usdValue.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">No tokens found in your wallet</p>
                      <button
                        onClick={scanWalletTokens}
                        className="text-xs text-pepu-yellow-orange hover:underline"
                      >
                        Try scanning again
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Tokens Indicator */}
                {selectedTokens.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-pepu-dark-green">
                        📌 {selectedTokens.length === 1 ? 'Selected Token' : `${selectedTokens.length} Tokens Selected`}
                      </span>
                      <button
                        onClick={clearSelectedTokens}
                        className="text-muted-foreground hover:text-muted-foreground text-xs"
                        title="Clear all selected tokens"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTokens.map((token, index) => (
                        <div key={token.address} className="flex items-center space-x-1 bg-pepu-light-green/20 px-2 py-1 rounded text-xs">
                          <span className="font-medium text-pepu-dark-green">{token.symbol}</span>
                          <span className="text-muted-foreground">
                            {Number(token.balance).toLocaleString()}
                            {token.usdValue && token.usdValue > 0 && (
                              <span> (${token.usdValue.toFixed(2)})</span>
                            )}
                          </span>
                          <button
                            onClick={() => removeTokenFromSelection(token.address)}
                            className="text-muted-foreground hover:text-muted-foreground ml-1"
                            title={`Remove ${token.symbol}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      selectedTokens.length === 1 
                        ? `Ask about ${selectedTokens[0].symbol}...` 
                        : selectedTokens.length > 1 
                        ? `Ask about ${selectedTokens.map(t => t.symbol).join(', ')}...` 
                        : "Ask about tokens, prices, or market trends..."
                    }
                    className="flex-1 p-3 border border-border rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-base text-foreground placeholder-muted-foreground"
                    disabled={isLoading}
                  />
                  <button
                    onClick={isLoading ? handleStopRequest : handleSendMessage}
                    disabled={!inputMessage.trim() && !isLoading}
                    className={`px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                      isLoading 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-pepu-yellow-orange text-pepu-dark-green hover:bg-pepu-yellow-orange/90'
                    }`}
                  >
                    {isLoading ? (
                      // Stop icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12v12H6z" />
                      </svg>
                    ) : (
                      // Send icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}