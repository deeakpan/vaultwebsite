'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tokenData?: any;
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
            <p className="text-xs text-gray-500">Source: {token.source}</p>
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
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Market Cap:</span>
            <br />
            <span className="text-gray-800">{formatNumber(token.market_cap)}</span>
          </div>
          <div>
            <span className="font-medium">24h Volume:</span>
            <br />
            <span className="text-gray-800">{formatNumber(token.volume_24h)}</span>
          </div>
        </div>
      )}
      
      {token.liquidity && token.liquidity > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">Liquidity:</span>
          <span className="text-gray-800 ml-1">{formatNumber(token.liquidity)}</span>
        </div>
      )}
      
      {token.address && (
        <div className="mt-2 text-xs text-gray-500">
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const VAULT_TOKEN_ADDRESS = '0x8746D6Fc80708775461226657a6947497764BBe6';
  const MINIMUM_VAULT_BALANCE = 0;

  const { data: vaultBalance, isLoading: isCheckingBalance } = useBalance({
    address,
    token: VAULT_TOKEN_ADDRESS as `0x${string}`,
  });

  useEffect(() => {
    if (isConnected && address && vaultBalance) {
      const balance = Number(vaultBalance.formatted);
      const hasEnoughBalance = balance >= MINIMUM_VAULT_BALANCE;
      setHasAccess(hasEnoughBalance);
    } else if (!isConnected || !address) {
      setHasAccess(false);
    }
  }, [isConnected, address, vaultBalance, MINIMUM_VAULT_BALANCE]);

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

  useEffect(() => {
    if (isOpen && hasAccess) {
      setMessages([{
        id: '1',
        text: 'Hello! I\'m VaultGPT, your AI assistant for Pepe Unchained analytics. I can analyze tokens, show market trends, and provide insights. Try asking:\n\n• "Tell me about PENK"\n• "Show trending tokens"\n• "Compare VAULT and SPRING"',
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, hasAccess]);

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
      tokenData = apiData.tokens.map((token: any) => ({
        name: token.name || 'Unknown Token',
        symbol: token.symbol || 'N/A',
        price: token.price || 0,
        market_cap: token.market_cap || null,
        volume_24h: token.volume_24h || null,
        price_change_24h: token.price_change_24h || null,
        liquidity: token.liquidity || null,
        address: token.address || '',
        source: token.source || 'unknown'
      }));
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !hasAccess) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/vaultgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
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
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm experiencing technical difficulties. Please try again or ask about Pepe Unchained analytics.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-pepu-dark-green">VaultGPT</h2>
              <p className="text-xs text-gray-600">AI Analytics Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Connect Your Wallet</h3>
                <p className="text-base text-gray-600 mb-4">Connect your wallet to access VaultGPT analytics</p>
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
          ) : isCheckingBalance ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pepu-yellow-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Checking Vault Balance</h3>
                <p className="text-base text-gray-600">Verifying your $Vault token balance...</p>
              </div>
            </div>
          ) : !hasAccess ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Insufficient Vault Balance</h3>
                <p className="text-base text-gray-600 mb-2">You need at least 1,000,000 $Vault tokens to access VaultGPT</p>
                <p className="text-sm text-gray-500 mb-4">Current balance: {vaultBalance?.formatted ? Number(vaultBalance.formatted).toLocaleString() : '0'} $Vault</p>
                <a 
                  href="https://pepuswap.com/#/swap?outputCurrency=0x8746D6Fc80708775461226657a6947497764BBe6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-pepu-yellow-orange text-pepu-dark-green px-6 py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors text-base"
                >
                  Buy More $Vault
                </a>
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
                            : 'bg-gray-50 text-black'
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
                    <div className="bg-gray-50 text-black px-4 py-3 rounded-lg">
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

              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about tokens, prices, or market trends..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-base text-black placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-pepu-yellow-orange text-pepu-dark-green px-4 py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
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