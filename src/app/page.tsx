'use client';


import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Treasury from '@/components/Treasury';
import Analytics from '@/components/Analytics';
import Rewards from '@/components/Rewards';
import News from '@/components/News';
import WalletSection from '@/components/WalletSection';
import ProjectInfo from '@/components/ProjectInfo';
import SuperBridge from '@/components/SuperBridge';
import Footer from '@/components/Footer';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Header />
      
      <main className="w-full px-4 py-4 md:py-8 sm:container sm:mx-auto">
        <Hero />
        
        <Treasury />
        
        <Analytics />
        
        <Rewards />
        
        <News />
        
        
        <WalletSection />
        
        <ProjectInfo />
        
        <section id="bridge" className="py-8 md:py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Bridge Assets
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bridge your PEPU tokens within the Pepe Unchained ecosystem. 
              Requires a minimum of 3,000,000 VAULT tokens to access.
            </p>
          </div>
          <SuperBridge />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
