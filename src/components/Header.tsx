'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaWallet } from 'react-icons/fa6';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-pepu-dark-green text-pepu-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
              <img 
                src="/anything-removebg-preview.png" 
                alt="Pepu Vault Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold">Pepu Vault</h1>
              <p className="text-pepu-light-green text-xs md:text-sm">Treasury & Rewards</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold">Pepu Vault</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 md:space-x-8">
            <a href="#treasury" className="hover:text-pepu-yellow-orange transition-colors text-sm md:text-base">
              Treasury
            </a>
            <a href="#analytics" className="hover:text-pepu-yellow-orange transition-colors text-sm md:text-base">
              Analytics
            </a>
            <a href="#rewards" className="hover:text-pepu-yellow-orange transition-colors text-sm md:text-base">
              Rewards
            </a>
            <a href="#news" className="hover:text-pepu-yellow-orange transition-colors text-sm md:text-base">
              News
            </a>
            <a href="#tools" className="hover:text-pepu-yellow-orange transition-colors text-sm md:text-base">
              Tools
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, openChainModal, authenticationStatus, mounted }) => {
                // Button states
                const ready = mounted && authenticationStatus !== 'loading';
                const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
                return (
                  <div
                    aria-hidden={!ready}
                    style={{
                      opacity: !ready ? 0 : 1,
                      pointerEvents: !ready ? 'none' : 'auto',
                    }}
                  >
                    {!connected ? (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="flex items-center gap-2 bg-pepu-yellow-orange text-pepu-dark-green px-4 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors shadow-lg text-xs md:text-sm"
                      >
                        <FaWallet className="w-5 h-5" />
                        <span className="hidden sm:inline">Connect Wallet</span>
                        <span className="sm:hidden">Connect</span>
                      </button>
                    ) : chain.unsupported ? (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg text-xs md:text-sm"
                      >
                        <FaWallet className="w-5 h-5" />
                        Wrong network
                      </button>
                    ) : (
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex items-center gap-2 bg-pepu-yellow-orange text-pepu-dark-green px-4 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors shadow-lg text-xs md:text-sm"
                      >
                        <FaWallet className="w-5 h-5" />
                        <span className="hidden sm:inline">{account.displayName}</span>
                        <span className="sm:hidden">Wallet</span>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-pepu-white p-1 md:p-2"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-3 pb-3 border-t border-pepu-light-green/20">
            <div className="flex flex-col space-y-2 pt-3">
              <a href="#treasury" className="hover:text-pepu-yellow-orange transition-colors text-sm py-2">
                Treasury
              </a>
              <a href="#analytics" className="hover:text-pepu-yellow-orange transition-colors text-sm py-2">
                Analytics
              </a>
              <a href="#rewards" className="hover:text-pepu-yellow-orange transition-colors text-sm py-2">
                Rewards
              </a>
              <a href="#news" className="hover:text-pepu-yellow-orange transition-colors text-sm py-2">
                News
              </a>
              <a href="#tools" className="hover:text-pepu-yellow-orange transition-colors text-sm py-2">
                Tools
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 