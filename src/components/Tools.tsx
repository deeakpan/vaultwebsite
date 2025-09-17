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
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'trading':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'explorer':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'utility':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
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
          <h2 className="text-4xl font-bold text-primary mb-4">
            Tools & Resources
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Essential tools and resources for navigating the PEPU ecosystem. 
            Bridge assets, trade tokens, and explore the blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{tool.icon}</div>
                <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
                  {getCategoryIcon(tool.category)}
                </div>
              </div>
              
              <h3 className="font-bold text-primary mb-2 group-hover:text-pepu-yellow-orange transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {tool.description}
              </p>
              
              <div className="flex items-center text-pepu-yellow-orange text-sm font-semibold group-hover:text-primary transition-colors">
                <span>Visit Tool</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 