'use client';

interface Tool {
  name: string;
  description: string;
  url: string;
  icon: string;
  category: 'bridge' | 'trading' | 'explorer' | 'utility';
}

export default function Tools() {
  const tools: Tool[] = [
    {
      name: 'PEPU Bridge',
      description: 'Bridge assets to PEPU Chain',
      url: 'https://bridge.pepu.io',
      icon: '🌉',
      category: 'bridge'
    },
    {
      name: 'GeckoTerminal',
      description: 'View $Vault pool and charts',
      url: 'https://www.geckoterminal.com/pepu/pools/0x1234567890abcdef',
      icon: '📊',
      category: 'trading'
    },
    {
      name: 'PEPU Explorer',
      description: 'Block explorer for PEPU Chain',
      url: 'https://explorer.pepu.io',
      icon: '🔍',
      category: 'explorer'
    },
    {
      name: 'Superbridge',
      description: 'Cross-chain bridge solution',
      url: 'https://superbridge.app',
      icon: '🌐',
      category: 'bridge'
    },
    {
      name: 'DEX Aggregator',
      description: 'Find best trading routes',
      url: 'https://dex.pepu.io',
      icon: '🔄',
      category: 'trading'
    },
    {
      name: 'Token Scanner',
      description: 'Scan and verify tokens',
      url: 'https://scanner.pepu.io',
      icon: '🔬',
      category: 'utility'
    },
    {
      name: 'Portfolio Tracker',
      description: 'Track your PEPU holdings',
      url: 'https://portfolio.pepu.io',
      icon: '💼',
      category: 'utility'
    },
    {
      name: 'Gas Tracker',
      description: 'Monitor gas prices',
      url: 'https://gas.pepu.io',
      icon: '⛽',
      category: 'utility'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bridge':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trading':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'explorer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'utility':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bridge':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'trading':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'explorer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'utility':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <section id="tools" className="py-16 bg-gradient-to-br from-pepu-yellow-orange/5 to-pepu-light-green/5">
              <div className="w-full px-4 sm:max-w-7xl sm:mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-pepu-dark-green mb-4">
            Tools & Resources
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Essential tools and resources for navigating the PEPU ecosystem. 
            Bridge assets, trade tokens, and explore the blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <a
              key={index}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl shadow-lg p-6 border border-pepu-light-green/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{tool.icon}</div>
                <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
                  {getCategoryIcon(tool.category)}
                </div>
              </div>
              
              <h3 className="font-bold text-pepu-dark-green mb-2 group-hover:text-pepu-yellow-orange transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {tool.description}
              </p>
              
              <div className="flex items-center text-pepu-yellow-orange text-sm font-semibold group-hover:text-pepu-dark-green transition-colors">
                <span>Visit Tool</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Buy $Vault</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Get started with $Vault tokens and join the community.
            </p>
            <a 
              href="https://pepuswap.com/#/swap?outputCurrency=0x8746d6fc80708775461226657a6947497764bbe6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-pepu-yellow-orange text-pepu-dark-green px-4 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors"
            >
              Buy Now
            </a>
          </div>

          <div className="bg-gradient-to-r from-pepu-yellow-orange to-pepu-light-green rounded-2xl p-6 text-pepu-dark-green">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pepu-dark-green rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Bridge Assets</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Bridge your assets to PEPU Chain to start trading.
            </p>
            <a 
              href="https://bridge.pepu.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-pepu-dark-green text-pepu-white px-4 py-2 rounded-lg font-semibold hover:bg-pepu-dark-green/90 transition-colors"
            >
              Bridge Now
            </a>
          </div>

          <div className="bg-gradient-to-r from-pepu-light-green to-pepu-yellow-orange rounded-2xl p-6 text-pepu-dark-green">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pepu-dark-green rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Explore Chain</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Explore transactions and contracts on PEPU Chain.
            </p>
            <a 
              href="https://explorer.pepu.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-pepu-dark-green text-pepu-white px-4 py-2 rounded-lg font-semibold hover:bg-pepu-dark-green/90 transition-colors"
            >
              Explore
            </a>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-pepu-light-green/20">
          <h3 className="text-2xl font-bold text-pepu-dark-green mb-6 text-center">
            Additional Resources
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pepu-light-green rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-pepu-dark-green mb-1">Documentation</h4>
              <p className="text-sm text-gray-600">Learn about PEPU Chain</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-pepu-yellow-orange rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h4 className="font-semibold text-pepu-dark-green mb-1">API Access</h4>
              <p className="text-sm text-gray-600">Developer resources</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-pepu-dark-green rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-pepu-dark-green mb-1">Community</h4>
              <p className="text-sm text-gray-600">Join discussions</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-pepu-light-green rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-pepu-dark-green mb-1">Support</h4>
              <p className="text-sm text-gray-600">Get help</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 