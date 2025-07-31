'use client';

import { useState } from 'react';

interface AnalyticsProps {
  isWalletConnected: boolean;
  vaultBalance: number;
}

export default function Analytics({ isWalletConnected, vaultBalance }: AnalyticsProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const requiredBalance = 1000000; // 1M $Vault tokens
  const hasAccess = isWalletConnected && vaultBalance >= requiredBalance;

  const exampleQueries = [
    "Which wallets are buying large amounts of token XY right now?",
    "What tokens are trending on the chain?",
    "Show me the top 10 holders of PEPU token",
    "Which tokens had the highest volume in the last 24 hours?",
    "Find wallets that bought more than 1000 tokens in the last hour"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !hasAccess) return;

    setIsLoading(true);
    setQueryHistory(prev => [query, ...prev.slice(0, 4)]);

    // Simulate AI response
    setTimeout(() => {
      const mockResponses = [
        "Based on recent on-chain data, I found 3 wallets that purchased significant amounts of token XY in the last 2 hours. The largest purchase was 50,000 tokens by wallet 0x7a8b...3f4c, followed by 25,000 tokens by 0x9c2d...1e7b. These transactions suggest growing interest in this token.",
        "Current trending tokens on PEPU Chain include: PEPU (24h volume: $2.4M), PEPE (24h volume: $1.8M), and VAULT (24h volume: $950K). PEPU shows the strongest momentum with a 15% price increase in the last hour.",
        "The top 10 PEPU holders are: 1) 0x8f7f...3e5f (2.5M tokens), 2) 0x1a2b...4c5d (1.8M tokens), 3) 0x3c4d...6e7f (1.2M tokens). These wallets hold approximately 45% of the total circulating supply.",
        "Highest volume tokens in the last 24 hours: 1) PEPU ($2.4M), 2) PEPE ($1.8M), 3) VAULT ($950K), 4) MOON ($720K), 5) ROCKET ($650K). PEPU leads with 15% price increase.",
        "I identified 7 wallets that purchased over 1000 tokens in the last hour. The most active was 0x5e6f...7g8h with 5,000 tokens purchased across 3 transactions. This suggests increased buying pressure."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setResponse(randomResponse);
      setIsLoading(false);
    }, 2000);
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`;
    }
    if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toString();
  };

  return (
    <section id="analytics" className="py-8 md:py-16 bg-gradient-to-br from-pepu-dark-green/5 to-pepu-yellow-orange/5">
              <div className="w-full px-4 sm:max-w-6xl sm:mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-pepu-dark-green mb-3 md:mb-4">
            Token Analytics & Insights
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered blockchain analytics for PEPU Chain. Ask natural language questions about 
            token movements, wallet behavior, and market trends.
          </p>
        </div>

        {/* Access Control */}
        {!isWalletConnected ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center border border-pepu-light-green/20">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pepu-yellow-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-pepu-dark-green mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
              Connect your wallet to access AI-powered blockchain analytics
            </p>
            <button className="bg-pepu-yellow-orange text-pepu-dark-green px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors text-sm md:text-base">
              Connect Wallet
            </button>
          </div>
        ) : vaultBalance < requiredBalance ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center border border-pepu-light-green/20">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pepu-yellow-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-pepu-dark-green mb-2">Insufficient Balance</h3>
            <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
              You need at least 1,000,000 $Vault tokens to access analytics
            </p>
            <div className="bg-pepu-light-green/10 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm md:text-base">Your Balance:</span>
                <span className="font-bold text-pepu-dark-green text-sm md:text-base">{formatBalance(vaultBalance)} $Vault</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600 text-sm md:text-base">Required:</span>
                <span className="font-bold text-pepu-yellow-orange text-sm md:text-base">1.0M $Vault</span>
              </div>
            </div>
            <button className="bg-pepu-dark-green text-pepu-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-pepu-dark-green/90 transition-colors text-sm md:text-base">
              Buy More $Vault
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Query Interface */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-pepu-light-green/20">
              <div className="flex items-center space-x-2 mb-4 md:mb-6">
                <div className="w-3 h-3 bg-pepu-light-green rounded-full animate-pulse"></div>
                <h3 className="text-lg md:text-xl font-bold text-pepu-dark-green">AI Analytics Access</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-pepu-dark-green mb-2">
                    Ask about PEPU Chain activity:
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Which wallets are buying large amounts of token XY right now?"
                    className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent resize-none text-sm md:text-base"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="w-full bg-pepu-yellow-orange text-pepu-dark-green py-2 md:py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Ask AI'
                  )}
                </button>
              </form>

              {/* Example Queries */}
              <div className="mt-4 md:mt-6">
                <h4 className="text-sm md:text-base font-semibold text-pepu-dark-green mb-2 md:mb-3">Example Queries:</h4>
                <div className="space-y-1 md:space-y-2">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(example)}
                      className="block w-full text-left text-xs md:text-sm text-gray-600 hover:text-pepu-yellow-orange transition-colors p-2 rounded hover:bg-pepu-light-green/10"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Display */}
            <div className="space-y-4 md:space-y-6">
              {/* Current Response */}
              {response && (
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-pepu-light-green/20">
                  <div className="flex items-center space-x-2 mb-3 md:mb-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-pepu-dark-green">AI Response</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{response}</p>
                </div>
              )}

              {/* Query History */}
              {queryHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-pepu-light-green/20">
                  <h3 className="text-base md:text-lg font-bold text-pepu-dark-green mb-3 md:mb-4">Recent Queries</h3>
                  <div className="space-y-2">
                    {queryHistory.map((histQuery, index) => (
                      <div key={index} className="p-2 md:p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-700">"{histQuery}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Access Status */}
              <div className="bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-xl p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-semibold text-pepu-dark-green">Analytics Access</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pepu-light-green rounded-full"></div>
                    <span className="text-xs md:text-sm text-pepu-dark-green">Active</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Your balance: {formatBalance(vaultBalance)} $Vault (✓ Meets requirement)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 