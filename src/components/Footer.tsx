'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-pepu-dark-green text-pepu-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                <span className="text-pepu-dark-green font-bold text-xl">P</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Pepu Vault</h3>
                <p className="text-pepu-light-green text-sm">Treasury & Rewards</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              The ultimate treasury management and community rewards platform for $Vault holders. 
              Experience the perfect blend of memecoin fun and serious utility.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://t.me/pepuvault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pepu-light-green/20 rounded-full flex items-center justify-center hover:bg-pepu-light-green/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/pepuvault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pepu-light-green/20 rounded-full flex items-center justify-center hover:bg-pepu-light-green/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/pepuvault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pepu-light-green/20 rounded-full flex items-center justify-center hover:bg-pepu-light-green/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://pepuscan.com/address/0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  Treasury
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/pepuvault_reward_tracker_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  Rewards
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/PepeX_AiBot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  News
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://pepuscan.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  Explorer
                </a>
              </li>
              <li>
                <a 
                  href="https://www.geckoterminal.com/pepe-unchained/tokens/0x8746D6Fc80708775461226657a6947497764BBe6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  GeckoTerminal
                </a>
              </li>
              <li>
                <a 
                  href="https://superbridge.pepubank.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  Superbridge
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/pepuvault" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pepu-yellow-orange transition-colors"
                >
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-pepu-light-green/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              © {currentYear} Pepu Vault. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-300 hover:text-pepu-yellow-orange transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-pepu-yellow-orange transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-pepu-yellow-orange transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-pepu-dark-green/50 rounded-lg border border-pepu-light-green/20">
          <p className="text-xs text-gray-300 text-center">
            <strong>Disclaimer:</strong> Cryptocurrency investments are subject to market risks. 
            The information provided on this website is for educational purposes only and should not 
            be considered as financial advice. Always conduct your own research before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
} 