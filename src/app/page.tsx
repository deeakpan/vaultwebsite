'use client';


import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Treasury from '@/components/Treasury';
import Rewards from '@/components/Rewards';
import News from '@/components/News';
import WalletSection from '@/components/WalletSection';
import ProjectInfo from '@/components/ProjectInfo';
import Footer from '@/components/Footer';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-pepu-white via-white to-pepu-light-green/10">
      <Header />
      
      <main className="w-full px-4 py-4 md:py-8 sm:container sm:mx-auto">
        <Hero />
        
        <Treasury />
        
        <Rewards />
        
        <News />
        
        <WalletSection />
        
        <ProjectInfo />
      </main>
      
      <Footer />
    </div>
  );
}
