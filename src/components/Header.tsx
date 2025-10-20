'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaWallet } from 'react-icons/fa6';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
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
              <p className="text-accent text-xs md:text-sm">Treasury & Rewards</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold">Pepu Vault</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 md:space-x-8">
            <a href="/" className="hover:text-accent transition-colors text-sm md:text-base">
              Home
            </a>
            <a href="/#treasury" className="hover:text-accent transition-colors text-sm md:text-base">
              Treasury
            </a>
            <a href="/#analytics" className="hover:text-accent transition-colors text-sm md:text-base">
              Analytics
            </a>
            <a href="/#rewards" className="hover:text-accent transition-colors text-sm md:text-base">
              Rewards
            </a>
            <a href="/#news" className="hover:text-accent transition-colors text-sm md:text-base">
              News
            </a>
            <a href="/#bridge" className="hover:text-accent transition-colors text-sm md:text-base">
              Bridge
            </a>
            <a href="/admin" className="hover:text-accent transition-colors text-sm md:text-base">
              Admin
            </a>
          </nav>

          {/* Wallet Connection & Theme Toggle */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
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
                        className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors shadow-lg text-xs md:text-sm"
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
                        className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors shadow-lg text-xs md:text-sm"
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
              className="lg:hidden text-primary-foreground p-1 md:p-2"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-3 pb-3 border-t border-accent/20">
            <div className="flex flex-col space-y-2 pt-3">
              <a href="/" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Home
              </a>
              <a href="/#treasury" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Treasury
              </a>
              <a href="/#analytics" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Analytics
              </a>
              <a href="/#rewards" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Rewards
              </a>
              <a href="/#news" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                News
              </a>
              <a href="/#bridge" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Bridge
              </a>
              <a href="/admin" className="hover:text-accent transition-colors text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Admin
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 