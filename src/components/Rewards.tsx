'use client';

import { useState } from 'react';

interface RewardData {
  wallet: string;
  lastVaultReward: string;
  totalVaultReward: string;
  lastPepuReward: string;
  totalPepuReward: string;
}

export default function Rewards() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [error, setError] = useState('');

  const checkRewards = async () => {
    console.log('Check rewards function called with wallet:', walletAddress);
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      setError('Invalid wallet address format');
      return;
    }
    setIsLoading(true);
    setError('');
    setRewardData(null);
    try {
      console.log('Making API request to /api/check-rewards');
      const response = await fetch('/api/check-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress.trim() }),
      });
      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response data:', result);
      if (!response.ok) {
        setError(result.error || 'Failed to check rewards');
        return;
      }
      if (result.success) {
        setRewardData(result.data);
      } else {
        setError('No reward data found for this wallet');
      }
    } catch (err) {
      console.error('Error in checkRewards:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <section id="rewards" className="py-16 bg-gradient-to-br from-pepu-yellow-orange/5 to-pepu-light-green/5">
              <div className="w-full px-0 md:max-w-6xl md:mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-pepu-dark-green mb-4">
            Check Your Rewards
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Enter your wallet address to check your $Vault and $PEPU rewards from our snapshot system.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-pepu-light-green/20 overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Left: Input & Results */}
            <div className="p-8">
              <label htmlFor="wallet" className="block text-base font-semibold text-pepu-dark-green mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter a valid wallet address"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pepu-dark-green focus:border-transparent text-lg bg-gray-50 placeholder-gray-400 text-black ${
                  walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
                autoComplete="off"
                spellCheck={false}
              />
              {walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) && (
                <div className="text-sm text-red-600 mt-1 mb-4">
                  Invalid wallet address format
                </div>
              )}
              <button
                onClick={checkRewards}
                disabled={isLoading || !walletAddress.trim()}
                className="mt-2 w-full px-8 py-3 bg-gradient-to-r from-pepu-yellow-orange to-pepu-dark-green text-white font-bold rounded-lg shadow-md hover:from-pepu-dark-green hover:to-pepu-yellow-orange transition-colors flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Check Rewards
                  </>
                )}
              </button>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-black text-base font-medium">{error}</p>
                </div>
              )}
              {rewardData && (
                <div className="mt-6">
                  <div className="bg-gradient-to-r from-pepu-light-green/10 to-pepu-yellow-orange/10 rounded-xl p-6 border border-pepu-light-green/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-pepu-dark-green">
                        Rewards for {formatAddress(rewardData.wallet)}
                      </h3>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Last Airdrop */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Last Airdrop</span>
                          <svg className="w-4 h-4 text-pepu-yellow-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">$Vault</div>
                            <div className="text-lg font-bold text-pepu-dark-green">
                              {parseFloat(rewardData.lastVaultReward).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">$PEPU</div>
                            <div className="text-lg font-bold text-pepu-yellow-orange">
                              {parseFloat(rewardData.lastPepuReward).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Rewards */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Total Rewards</span>
                          <svg className="w-4 h-4 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">$Vault</div>
                            <div className="text-lg font-bold text-pepu-dark-green">
                              {parseFloat(rewardData.totalVaultReward).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">$PEPU</div>
                            <div className="text-lg font-bold text-pepu-yellow-orange">
                              {parseFloat(rewardData.totalPepuReward).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Write-ups/Info */}
            <div className="p-8 bg-gradient-to-br from-pepu-light-green/5 to-pepu-yellow-orange/5">
              <h3 className="text-2xl font-bold text-pepu-dark-green mb-6">How Rewards Work</h3>
              <ul className="text-base text-black space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-pepu-yellow-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Snapshots are taken every 14 days automatically
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-pepu-yellow-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Your $Vault balance at snapshot time determines rewards
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-pepu-yellow-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Rewards are distributed in PEPU tokens
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-pepu-yellow-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Higher balances receive proportionally more rewards
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-pepu-yellow-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  No action required - rewards are sent automatically
                </li>
              </ul>
              <div className="mt-auto">
                <a 
                  href="https://t.me/pepuvault" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md"
                >
                  Join Telegram Channel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 