'use client';

import { useState } from 'react';

interface Tokenomics {
  category: string;
  percentage: number;
  description: string;
  color: string;
}

export default function ProjectInfo() {
  const [activeTab, setActiveTab] = useState('tokenomics');

  const tokenomics: Tokenomics[] = [
    { category: 'Treasury', percentage: 30, description: 'Reserved for treasury management and community rewards', color: 'bg-pepu-dark-green' },
    { category: 'Liquidity', percentage: 25, description: 'Locked for trading liquidity and price stability', color: 'bg-pepu-light-green' },
    { category: 'Community', percentage: 20, description: 'Distributed to community members and early supporters', color: 'bg-pepu-yellow-orange' },
    { category: 'Development', percentage: 15, description: 'Funds for ongoing development and partnerships', color: 'bg-blue-500' },
    { category: 'Team', percentage: 10, description: 'Team allocation with vesting schedule', color: 'bg-purple-500' }
  ];

  const contractAddresses = {
    vault: '0x8F7F4A2B8C9D1E3F5A7B9C1D3E5F7A9B1C3D5E7F',
    treasury: '0x1A2B3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B',
    rewards: '0x2B3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C'
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-pepu-dark-green/5 to-pepu-yellow-orange/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-pepu-dark-green mb-4">
            Project Information
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about $Vault tokenomics, contract addresses, and the team behind Pepu Vault.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg border border-pepu-light-green/20">
            {['tokenomics', 'contracts', 'team', 'roadmap'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-pepu-yellow-orange text-pepu-dark-green'
                    : 'text-gray-600 hover:text-pepu-dark-green'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-pepu-light-green/20 overflow-hidden">
          {activeTab === 'tokenomics' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-pepu-dark-green mb-6">Tokenomics</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-pepu-dark-green mb-4">Supply Distribution</h4>
                  <div className="space-y-4">
                    {tokenomics.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-pepu-dark-green">{item.category}</span>
                          <span className="font-bold text-pepu-yellow-orange">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-pepu-dark-green mb-4">Key Metrics</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-pepu-light-green/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Supply</span>
                        <span className="font-bold text-pepu-dark-green">1,000,000,000</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-pepu-yellow-orange/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Circulating Supply</span>
                        <span className="font-bold text-pepu-yellow-orange">750,000,000</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-pepu-dark-green/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Holders</span>
                        <span className="font-bold text-pepu-dark-green">1,250+</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Market Cap</span>
                        <span className="font-bold text-blue-600">$2.4M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-pepu-dark-green mb-6">Contract Addresses</h3>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-pepu-light-green/10 rounded-xl border border-pepu-light-green/20">
                    <h4 className="font-semibold text-pepu-dark-green mb-3">$Vault Token</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contract Address</span>
                      <a 
                        href={`https://explorer.pepu.io/address/${contractAddresses.vault}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-pepu-yellow-orange hover:underline"
                      >
                        {formatAddress(contractAddresses.vault)}
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      ERC-20 token on PEPU Chain
                    </div>
                  </div>

                  <div className="p-6 bg-pepu-yellow-orange/10 rounded-xl border border-pepu-yellow-orange/20">
                    <h4 className="font-semibold text-pepu-dark-green mb-3">Treasury Contract</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contract Address</span>
                      <a 
                        href={`https://explorer.pepu.io/address/${contractAddresses.treasury}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-pepu-yellow-orange hover:underline"
                      >
                        {formatAddress(contractAddresses.treasury)}
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Treasury management and rewards distribution
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-pepu-dark-green/10 rounded-xl border border-pepu-dark-green/20">
                  <h4 className="font-semibold text-pepu-dark-green mb-3">Rewards Contract</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contract Address</span>
                    <a 
                      href={`https://explorer.pepu.io/address/${contractAddresses.rewards}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-pepu-yellow-orange hover:underline"
                    >
                      {formatAddress(contractAddresses.rewards)}
                    </a>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Automated snapshot and reward distribution system
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                  <h4 className="font-semibold text-pepu-dark-green mb-2">Verification</h4>
                  <p className="text-sm text-gray-600">
                    All contracts are verified on PEPU Chain explorer. You can view the source code 
                    and verify the functionality directly on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-pepu-dark-green mb-6">Team & Mission</h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-pepu-dark-green mb-4">Our Mission</h4>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Pepu Vault aims to create a sustainable and transparent treasury management system 
                    that rewards long-term holders while building a strong community around the PEPU ecosystem.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    We believe in the power of community-driven projects and strive to provide the tools 
                    and infrastructure needed for the PEPU Chain to thrive.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-pepu-dark-green mb-4">Core Values</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pepu-light-green rounded-full"></div>
                      <span className="text-gray-700">Transparency in all operations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full"></div>
                      <span className="text-gray-700">Community-first approach</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pepu-dark-green rounded-full"></div>
                      <span className="text-gray-700">Sustainable growth strategies</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Innovation in DeFi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-xl">
                <h4 className="font-semibold text-pepu-dark-green mb-3">Community Links</h4>
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
              <h3 className="text-2xl font-bold text-pepu-dark-green mb-6">Roadmap</h3>
              
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pepu-light-green"></div>
                  
                  <div className="relative pl-12 pb-8">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-pepu-dark-green mb-2">Phase 1: Foundation (Q1 2024)</h4>
                    <p className="text-gray-600">Launch of $Vault token, treasury setup, and initial community building</p>
                  </div>

                  <div className="relative pl-12 pb-8">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-pepu-light-green rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-pepu-dark-green mb-2">Phase 2: Growth (Q2 2024)</h4>
                    <p className="text-gray-600">AI analytics integration, governance features, and expanded treasury strategies</p>
                  </div>

                  <div className="relative pl-12 pb-8">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-pepu-dark-green rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-pepu-dark-green mb-2">Phase 3: Innovation (Q3 2024)</h4>
                    <p className="text-gray-600">Advanced DeFi integrations, cross-chain bridges, and ecosystem partnerships</p>
                  </div>

                  <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-pepu-dark-green mb-2">Phase 4: Expansion (Q4 2024)</h4>
                    <p className="text-gray-600">Multi-chain deployment, institutional partnerships, and global adoption</p>
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