'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LabelList } from 'recharts';

interface Tokenomics {
  category: string;
  percentage: number;
  description: string;
  color: string;
}

export default function ProjectInfo() {
  const [activeTab, setActiveTab] = useState('tokenomics');
  const [vaultStats, setVaultStats] = useState({
    marketCap: 0,
    price: 0,
    fdv: 0,
    volume24h: 0,
    isLoading: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch VAULT token statistics
  const fetchVaultStats = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/vault-stats');
      if (response.ok) {
        const data = await response.json();
        console.log('ProjectInfo - Fetched vault stats:', data);
        setVaultStats({
          ...data,
          isLoading: false
        });
        console.log('ProjectInfo - Updated vaultStats state:', {
          ...data,
          isLoading: false
        });
      } else {
        console.error('ProjectInfo - Failed to fetch vault stats:', response.status);
        setVaultStats(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('ProjectInfo - Error fetching VAULT stats:', error);
      setVaultStats(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVaultStats();
  }, []);

  const tokenomics: Tokenomics[] = [
    { category: 'Snapshot Distribution', percentage: 60, description: 'Distributed to all eligible holders at each snapshot.', color: 'bg-pepu-yellow-orange' },
    { category: 'Added to Vault Pot', percentage: 20, description: 'Added to the vault pot for future rewards and growth.', color: 'bg-orange-500' },
    { category: 'Loyalty Rewards', percentage: 10, description: 'Extra rewards for loyal holders.', color: 'bg-pink-500' },
    { category: 'Buyback & Burn', percentage: 10, description: 'Used for buyback and burn of VAULT tokens.', color: 'bg-fuchsia-500' }
  ];

  // Chart data with hex colors for recharts
  const chartData = [
    { name: 'Snapshot Distribution', value: 60, color: '#f59e0b' },
    { name: 'Added to Vault Pot', value: 20, color: '#f97316' },
    { name: 'Loyalty Rewards', value: 10, color: '#ec4899' },
    { name: 'Buyback & Burn', value: 10, color: '#a855f7' }
  ];

  const contractAddresses = {
    vault: '0x8746D6Fc80708775461226657a6947497764BBe6',
    treasury: '0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E',
    rewards: '0x8746D6Fc80708775461226657a6947497764BBe6' // Same as vault for now
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatUSD = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '$0.00';
    
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(2)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(2)}K`;
    } else if (numValue < 0.01 && numValue > 0) {
      // For very small numbers, show more decimal places
      return `$${numValue.toFixed(8)}`;
    }
    return `$${numValue.toFixed(2)}`;
  };

  const formatNumber = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(2)}M`;
    } else if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(2)}K`;
    }
    return numValue.toFixed(0);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-pepu-dark-green/5 to-pepu-yellow-orange/5">
              <div className="w-full px-0 md:max-w-6xl md:mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Project Information
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn about $Vault tokenomics, contract addresses, and the team behind Pepu Vault.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-card rounded-lg p-1 shadow-md border border-border max-w-md w-full">
            <div className="grid grid-cols-4 gap-1">
              {['tokenomics', 'contracts', 'team', 'roadmap'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-pepu-yellow-orange text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden w-full sm:max-w-full px-0">
          {activeTab === 'tokenomics' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-primary">Tokenomics & Live Data</h3>
                  <button
                    onClick={fetchVaultStats}
                    disabled={isRefreshing}
                    className="flex items-center justify-center bg-pepu-yellow-orange text-primary p-2 rounded-lg hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={fetchVaultStats}
                  disabled={isRefreshing}
                  className="hidden sm:flex items-center space-x-2 bg-pepu-yellow-orange text-primary px-3 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50 text-sm"
                >
                  <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
              </div>
              
              {/* Live Statistics Section */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  Live Market Statistics
                </h4>
                
                {/* Current Price Highlight */}
                <div className="mb-6 p-6 bg-gradient-to-r from-pepu-yellow-orange/20 to-pepu-yellow-orange/10 rounded-xl border border-pepu-yellow-orange/30">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Current VAULT Price</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatUSD(vaultStats.price)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Real-time from GeckoTerminal</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                  {vaultStats.isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-2 sm:p-4 bg-gradient-to-br from-pepu-light-green/20 to-pepu-light-green/10 rounded-xl border border-pepu-light-green/30">
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1">Market Cap</div>
                        <div className="text-base sm:text-xl font-bold text-primary">{formatUSD(vaultStats.fdv)}</div>
                      </div>
                      <div className="p-2 sm:p-4 bg-gradient-to-br from-pepu-dark-green/20 to-pepu-dark-green/10 rounded-xl border border-pepu-dark-green/30">
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1">24h Volume</div>
                        <div className="text-base sm:text-xl font-bold text-primary">{formatUSD(vaultStats.volume24h)}</div>
                      </div>
                      <div className="p-2 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1">Fully Diluted Value</div>
                        <div className="text-base sm:text-xl font-bold text-primary">{formatUSD(vaultStats.fdv)}</div>
                      </div>

                    </>
                  )}
                </div>
              </div>

              {/* Tokenomics Section */}
              <div className="mb-8">
                <div className="w-full flex justify-center mb-6">
                  {/* Pie chart for profit distribution */}
                  <div className="w-full max-w-md">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                          <LabelList 
                            dataKey="name" 
                            position="outside" 
                            formatter={(value) => value}
                            fontSize={12}
                            fill="#374151"
                          />
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value}%`, name]}
                          labelStyle={{ color: '#1f2937' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-primary mb-4">Profit Distribution Structure</h4>
              <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {tokenomics.map((item, index) => (
                      <div key={index} className="p-4 bg-card rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-primary">{item.category}</span>
                          <span className="font-bold text-2xl text-pepu-yellow-orange">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-pepu-light-green/20 to-pepu-light-green/10 rounded-xl border border-pepu-light-green/30">
                      <h5 className="font-semibold text-primary mb-3">Initial Treasury Setup</h5>
                      <div className="space-y-3">
                      <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Initial PEPU</span>
                          <span className="font-bold text-primary">100,000 PEPU</span>
                      </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Initial VAULT</span>
                          <span className="font-bold text-primary">30,000,000 VAULT</span>
                    </div>
                      <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Investment Cycle</span>
                          <span className="font-bold text-primary">14-16 Days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-pepu-yellow-orange/20 to-pepu-yellow-orange/10 rounded-xl border border-pepu-yellow-orange/30">
                      <h5 className="font-semibold text-primary mb-3">Investment Strategy</h5>
                      <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                          <span>Low Risk (Established Projects)</span>
                          <span className="font-semibold">70%</span>
                      </div>
                        <div className="flex items-center justify-between">
                          <span>High Risk (New Projects)</span>
                          <span className="font-semibold">10%</span>
                    </div>
                      <div className="flex items-center justify-between">
                          <span>Community Decision</span>
                          <span className="font-semibold">20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-primary mb-6">Contract Addresses</h3>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-pepu-light-green/10 rounded-xl border border-border">
                    <h4 className="font-semibold text-primary mb-3">$Vault Token</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contract Address</span>
                      <a 
                        href={`https://pepuscan.com/address/${contractAddresses.vault}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-pepu-yellow-orange hover:underline"
                      >
                        {formatAddress(contractAddresses.vault)}
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      ERC-20 token on PEPU Chain
                    </div>
                  </div>

                  <div className="p-6 bg-pepu-yellow-orange/10 rounded-xl border border-pepu-yellow-orange/20">
                    <h4 className="font-semibold text-primary mb-3">Treasury Contract</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contract Address</span>
                      <a 
                        href={`https://pepuscan.com/address/${contractAddresses.treasury}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-pepu-yellow-orange hover:underline"
                      >
                        {formatAddress(contractAddresses.treasury)}
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Treasury management and rewards distribution
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-pepu-dark-green/10 rounded-xl border border-pepu-dark-green/20">
                  <h4 className="font-semibold text-primary mb-3">Rewards Contract</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contract Address</span>
                    <a 
                      href={`https://pepuscan.com/address/${contractAddresses.rewards}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-pepu-yellow-orange hover:underline"
                    >
                      {formatAddress(contractAddresses.rewards)}
                    </a>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Automated snapshot and reward distribution system
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    All contracts are verified on PEPU Chain explorer. You can view the source code 
                    and verify the functionality directly on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-primary mb-6">Team & Mission</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-4">Our Mission</h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Pepu Vault aims to create a sustainable and transparent treasury management system 
                    that rewards long-term holders while building a strong community around the PEPU ecosystem.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe in the power of community-driven projects and strive to provide the tools 
                    and infrastructure needed for the PEPU Chain to thrive.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary mb-4">Core Values</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pepu-light-green rounded-full"></div>
                      <span className="text-muted-foreground">Transparency in all operations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full"></div>
                      <span className="text-muted-foreground">Community-first approach</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pepu-dark-green rounded-full"></div>
                      <span className="text-muted-foreground">Sustainable growth strategies</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-muted-foreground">Innovation in DeFi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-xl">
                <h4 className="font-semibold text-primary mb-3">Community Links</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <a 
                    href="https://t.me/pepuvault"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Telegram</span>
                  </a>
                  
                  <a 
                    href="https://twitter.com/pepuvault"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span>Twitter</span>
                  </a>
                  
                  <a 
                    href="https://github.com/pepuvault"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-primary mb-6">Roadmap</h3>
              
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pepu-light-green"></div>
                  
                  <div className="relative pl-12 pb-8">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-primary mb-2">✅ Phase 1: Foundation (Q2 2025 – completed)</h4>
                    <div className="text-muted-foreground space-y-1">
                      <p>• Launch of $Vault Token</p>
                      <p>• Treasury setup & first investments</p>
                      <p>• Community building started</p>
                    </div>
                  </div>

                  <div className="relative pl-12 pb-8">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-pepu-light-green rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-primary mb-2">🚀 Phase 2: Growth (Q3 – Q4 2025)</h4>
                    <div className="text-muted-foreground space-y-1">
                      <p>• VaultGPT launch</p>
                      <p>• Increase of investment budget</p>
                      <p>• Expanded treasury strategies</p>
                      <p>• More utilities for holders</p>
                    </div>
                  </div>

                  <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-pepu-dark-green rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-primary mb-2">⚡ Phase 3: Innovation (from Q1 2026)</h4>
                    <div className="text-muted-foreground space-y-1">
                      <p>• VaultGPT improvements</p>
                      <p>• Launch of the Pepu Vault Game</p>
                      <p>• Exciting surprises for the community 🎁</p>
                      <p>• Stronger community integration & interactivity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 