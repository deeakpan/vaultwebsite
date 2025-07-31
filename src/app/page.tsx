'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Treasury from '@/components/Treasury';
import Rewards from '@/components/Rewards';
import News from '@/components/News';
import WalletSection from '@/components/WalletSection';
import ProjectInfo from '@/components/ProjectInfo';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [vaultBalance, setVaultBalance] = useState(0);

  const handleWalletConnection = (address: string, balance: number) => {
    setWalletAddress(address);
    setVaultBalance(balance);
    setIsWalletConnected(true);
  };

  const handleWalletDisconnection = () => {
    setWalletAddress('');
    setVaultBalance(0);
    setIsWalletConnected(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pepu-white via-white to-pepu-light-green/10">
      <Header 
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        vaultBalance={vaultBalance}
        onConnect={handleWalletConnection}
        onDisconnect={handleWalletDisconnection}
      />
      
      <main className="container mx-auto px-4 py-4 md:py-8">
        <Hero />
        
        <Treasury />
        
        <Rewards />
        
        <News />
        
        <WalletSection 
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          vaultBalance={vaultBalance}
          onConnect={handleWalletConnection}
          onDisconnect={handleWalletDisconnection}
        />
        
        <ProjectInfo />
      </main>
      
      <Footer />
    </div>
  );
}
