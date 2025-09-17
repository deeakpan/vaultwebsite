'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { FaWallet } from 'react-icons/fa6';

export default function Analytics() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const { address, isConnected } = useAccount();
  
  // Get VAULT token balance
  const { data: vaultBalance } = useBalance({
    address: address,
    token: '0x8746D6Fc80708775461226657a6947497764BBe6' as `0x${string}`, // VAULT token address
    chainId: 97741,
  });

  // Fix threshold calculation for 18 decimals
  const requiredBalance = BigInt(1000000) * BigInt(10) ** BigInt(18); // 1M tokens with 18 decimals
  const hasAccess = isConnected && (vaultBalance?.value ? vaultBalance.value >= requiredBalance : false);

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

  const formatBalance = (balance: bigint) => {
    // Convert BigInt to string to avoid precision loss, then parse
    const balanceStr = balance.toString();
    const balanceNumber = parseFloat(balanceStr) / Math.pow(10, 18);
    
    if (balanceNumber >= 1000000) {
      return `${(balanceNumber / 1000000).toFixed(1)}M`;
    }
    if (balanceNumber >= 1000) {
      return `${(balanceNumber / 1000).toFixed(1)}K`;
    }
    return balanceNumber.toFixed(2);
  };

  return (
    <section id="analytics" className="py-8 md:py-16 bg-gradient-to-br from-pepu-dark-green/5 to-pepu-yellow-orange/5">
      <div className="w-full px-4 sm:max-w-6xl sm:mx-auto">
        {/* Access Control */}
        {!isConnected ? (
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 text-center border border-border">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button 
                  onClick={openConnectModal}
                  className="bg-pepu-yellow-orange text-primary px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors text-sm md:text-base flex items-center gap-2 mx-auto"
                >
                  <FaWallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        ) : (vaultBalance?.value ? vaultBalance.value < requiredBalance : true) ? (
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 text-center border border-border">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pepu-yellow-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">Insufficient Balance</h3>
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
              You need at least 1,000,000 $Vault tokens to access analytics
            </p>
            <div className="bg-pepu-light-green/10 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm md:text-base">Your Balance:</span>
                <span className="font-bold text-primary text-sm md:text-base">{formatBalance(vaultBalance?.value || BigInt(0))} $Vault</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground text-sm md:text-base">Required:</span>
                <span className="font-bold text-pepu-yellow-orange text-sm md:text-base">1.0M $Vault</span>
              </div>
            </div>
            <a 
              href="https://pepuswap.com/#/swap?outputCurrency=0x8746d6fc80708775461226657a6947497764bbe6"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pepu-dark-green text-pepu-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-pepu-dark-green/90 transition-colors text-sm md:text-base inline-block text-center"
            >
              Buy More $Vault
            </a>
          </div>
        ) : (
          // Simple access message instead of full analytics form
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 text-center border border-border">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pepu-light-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">AI Analytics Access</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              You have access to AI Analytics (✓)
            </p>
            <div className="bg-pepu-light-green/10 p-3 md:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm md:text-base">Your Balance:</span>
                <span className="font-bold text-primary text-sm md:text-base">{formatBalance(vaultBalance?.value || BigInt(0))} $Vault</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 