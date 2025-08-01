'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useBalance } from 'wagmi';

export default function WalletSection() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Get actual VAULT token balance
  const { data: vaultBalanceData } = useBalance({
    address: address,
    token: '0x8746D6Fc80708775461226657a6947497764BBe6' as `0x${string}`, // VAULT token address
    chainId: 97741,
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    <section className="py-16 bg-gradient-to-br from-pepu-white to-pepu-light-green/5">
              <div className="w-full px-0 md:max-w-6xl md:mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-pepu-dark-green mb-4">
            Wallet Connection
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your wallet to access personalized features, view your $Vault balance, 
            and participate in community governance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-pepu-light-green/20">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isConnected ? 'bg-pepu-light-green' : 'bg-pepu-yellow-orange'
              }`}>
                <svg className="w-10 h-10 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-pepu-dark-green mb-2">
                {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
              </h3>
              <p className="text-gray-600">
                {isConnected 
                  ? 'Your wallet is connected and ready to use'
                  : 'Connect your wallet to access all features'
                }
              </p>
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-pepu-light-green/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wallet Address</span>
                    <span className="font-mono text-sm text-pepu-dark-green">{formatAddress(address!)}</span>
                  </div>
                </div>
                <div className="p-4 bg-pepu-yellow-orange/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">$Vault Balance</span>
                    <span className="font-bold text-pepu-yellow-orange">{formatBalance(vaultBalanceData?.value || BigInt(0))}</span>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-pepu-dark-green mb-2">Supported Networks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pepu-light-green rounded-full"></div>
                      <span className="text-sm text-gray-600">PEPU Chain (Primary)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Ethereum Mainnet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Polygon</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-pepu-light-green/10 rounded-lg">
                  <h4 className="font-semibold text-pepu-dark-green mb-2">Features Available</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View your $Vault balance</li>
                    <li>• Access AI analytics (1M+ tokens)</li>
                    <li>• Participate in governance</li>
                    <li>• Track reward history</li>
                    <li>• Receive notifications</li>
                  </ul>
                </div>
                <ConnectButton showBalance={false} />
              </div>
            )}
          </div>

          {/* User Features */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-pepu-light-green/20">
              <h3 className="text-xl font-bold text-pepu-dark-green mb-4">Your Dashboard</h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  isConnected ? 'bg-pepu-light-green/10 border-pepu-light-green/30' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isConnected ? 'bg-pepu-light-green' : 'bg-gray-300'
                      }`}>
                        <svg className="w-4 h-4 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-pepu-dark-green">AI Analytics</span>
                    </div>
                    <span className={`text-sm ${isConnected && vaultBalanceData?.value && parseFloat(vaultBalanceData.value.toString()) / Math.pow(10, 18) >= 1000000 ? 'text-green-600' : 'text-gray-500'}`}>
                      {isConnected && vaultBalanceData?.value && parseFloat(vaultBalanceData.value.toString()) / Math.pow(10, 18) >= 1000000 ? 'Available' : '1M+ Required'}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isConnected ? 'bg-pepu-yellow-orange/10 border-pepu-yellow-orange/30' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isConnected ? 'bg-pepu-yellow-orange' : 'bg-gray-300'
                      }`}>
                        <svg className="w-4 h-4 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-pepu-dark-green">Rewards Tracking</span>
                    </div>
                    <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                      {isConnected ? 'Available' : 'Connect Required'}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isConnected ? 'bg-pepu-dark-green/10 border-pepu-dark-green/30' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isConnected ? 'bg-pepu-dark-green' : 'bg-gray-300'
                      }`}>
                        <svg className="w-4 h-4 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-pepu-dark-green">Governance Voting</span>
                    </div>
                    <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                      {isConnected ? 'Available' : 'Connect Required'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Get Started</h3>
              <p className="text-sm opacity-90 mb-4">
                Connect your wallet to unlock all features and start earning rewards.
              </p>
              {!isConnected && (
                <ConnectButton showBalance={false} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 