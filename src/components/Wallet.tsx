'use client';

export default function Wallet() {
  return (
    <section className="py-16 bg-gradient-to-br from-pepu-dark-green/10 to-pepu-light-green/10">
      <div className="w-full px-4 md:max-w-6xl md:mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            PEPU VAULT Wallet
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A non-custodial crypto wallet for Ethereum and PEPU with built-in rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Overview Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-pepu-light-green rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary">Overview</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              PEPU VAULT is a non-custodial crypto wallet designed for Ethereum and PEPU ecosystems. 
              Your private keys are encrypted and stored securely in your browser's localStorage, 
              giving you full control of your assets.
            </p>
            <div className="mt-6">
              <a
                href="https://wallet.pepuvault.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-pepu-light-green text-primary px-6 py-3 rounded-lg font-semibold hover:bg-pepu-light-green/90 transition-colors"
              >
                <span>Open Web Wallet</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary">Core Features</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-pepu-light-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-primary">Non-custodial:</strong> Private keys encrypted in browser localStorage</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-pepu-light-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-primary">Multi-platform:</strong> Next.js web app + Chromium extension + dApp SDK</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-pepu-light-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-primary">Built-in dApp browser:</strong> Injects window.ethereum provider for Web3 dApps</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-pepu-light-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-primary">Token operations:</strong> Send, receive, swap tokens; bridge between L1/L2</span>
              </li>
            </ul>
          </div>

          {/* Rewards Card */}
          <div className="md:col-span-2 bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Rewards System</h3>
            </div>
            <p className="mb-6 opacity-90">
              Earn VAULT tokens as cashback on every transfer and swap. The more you use the wallet, 
              the more you earn!
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-2">~$0.005</div>
                <div className="text-sm opacity-90">Per transfer</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-2">0.085%</div>
                <div className="text-sm opacity-90">Of swap value</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-2">1M VAULT</div>
                <div className="text-sm opacity-90">Minimum to be eligible</div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm">
                <strong>Note:</strong> You must hold at least 1M VAULT tokens to be eligible for rewards. 
                Rewards are automatically distributed to your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
