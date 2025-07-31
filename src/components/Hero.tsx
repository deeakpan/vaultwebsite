'use client';

import { useState, useEffect } from 'react';

export default function Hero() {
  const [snapshotData, setSnapshotData] = useState({
    totalRewards: 45000,
    lastSnapshot: '2025-07-26T07:00:00Z'
  });

  const [timeUntilNextSnapshot, setTimeUntilNextSnapshot] = useState('');

  useEffect(() => {
    const calculateTimeUntilSnapshot = () => {
      const now = new Date();
      const lastSnapshot = new Date(snapshotData.lastSnapshot);
      const nextSnapshot = new Date(lastSnapshot.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
      const timeDiff = nextSnapshot.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeUntilNextSnapshot('Snapshot due!');
        return;
      }

      // Format next snapshot date
      const nextSnapshotDate = new Date(lastSnapshot.getTime() + 14 * 24 * 60 * 60 * 1000);
      const day = nextSnapshotDate.getDate();
      const month = nextSnapshotDate.getMonth() + 1; // getMonth() returns 0-11
      const year = nextSnapshotDate.getFullYear();
      
      setTimeUntilNextSnapshot(`${day}/${month}/${year}`);
    };

    calculateTimeUntilSnapshot();
    const interval = setInterval(calculateTimeUntilSnapshot, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [snapshotData.lastSnapshot]);

  return (
    <section className="py-8 md:py-16 lg:py-24">
      <div className="w-full px-4 sm:max-w-6xl sm:mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Main Content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-pepu-yellow-orange/20 text-pepu-yellow-orange px-3 py-2 rounded-full text-xs md:text-sm font-semibold">
                <span className="w-2 h-2 bg-pepu-yellow-orange rounded-full animate-pulse"></span>
                <span>Live on PEPU Chain</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-pepu-dark-green leading-tight">
                Welcome to{' '}
                <span className="text-pepu-yellow-orange">Pepu Vault</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                The ultimate treasury management and community rewards platform for $Vault holders. 
                Experience the perfect blend of memecoin fun and serious utility.
              </p>
            </div>

                         {/* Core Strengths */}
             <div className="space-y-4 md:space-y-6">
               <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-pepu-light-green/20">
                 <div className="flex items-center space-x-3 md:space-x-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-pepu-dark-green rounded-lg flex items-center justify-center flex-shrink-0">
                     <svg className="w-5 h-5 md:w-6 md:h-6 text-pepu-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                     </svg>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-pepu-dark-green text-sm md:text-base mb-1">Treasury Management</h3>
                     <p className="text-xs md:text-sm text-gray-600 leading-relaxed">70% established, 10% high-risk, 20% community-voted</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-pepu-light-green/20">
                 <div className="flex items-center space-x-3 md:space-x-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-pepu-yellow-orange rounded-lg flex items-center justify-center flex-shrink-0">
                     <svg className="w-5 h-5 md:w-6 md:h-6 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-pepu-dark-green text-sm md:text-base mb-1">Community Rewards</h3>
                     <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Bi-weekly snapshots with automatic PEPU distribution</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-pepu-light-green/20">
                 <div className="flex items-center space-x-3 md:space-x-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-pepu-light-green rounded-lg flex items-center justify-center flex-shrink-0">
                     <svg className="w-5 h-5 md:w-6 md:h-6 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                     </svg>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-pepu-dark-green text-sm md:text-base mb-1">Active Holders</h3>
                     <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Growing community of dedicated $Vault holders</p>
                   </div>
                 </div>
               </div>
             </div>

                         {/* CTA Buttons */}
             <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
               <a 
                 href="https://www.geckoterminal.com/pepe-unchained/pools/0x103ea0ca60f7cb79c1b674b1edf103c625c6b589"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="border-2 border-pepu-dark-green text-pepu-dark-green px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-pepu-dark-green hover:text-pepu-white transition-colors inline-block text-center"
               >
                 Buy $Vault
               </a>
             </div>
          </div>

          {/* Live Data Display */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-pepu-light-green/20">
              <h3 className="text-xl md:text-2xl font-bold text-pepu-dark-green mb-4 md:mb-6">Live Snapshot Activity</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-3 md:p-4 bg-pepu-yellow-orange/10 rounded-lg">
                  <span className="text-gray-700 text-sm md:text-base">Total Rewards Distributed</span>
                  <span className="font-bold text-pepu-yellow-orange text-sm md:text-base">{snapshotData.totalRewards.toLocaleString()} PEPU</span>
                </div>
                
                <div className="flex justify-between items-center p-3 md:p-4 bg-pepu-dark-green/10 rounded-lg">
                  <span className="text-gray-700 text-sm md:text-base">Next Snapshot</span>
                  <span className="font-bold text-pepu-dark-green text-sm md:text-base">{timeUntilNextSnapshot}</span>
                </div>
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pepu-light-green rounded-full animate-pulse"></div>
                  <span className="text-xs md:text-sm font-semibold text-pepu-dark-green">Wallet Connection Status</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Connect your wallet to view personalized data</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-pepu-dark-green text-pepu-white p-3 md:p-4 rounded-xl text-center">
                <div className="text-lg md:text-2xl font-bold">$2.4M</div>
                <div className="text-xs md:text-sm opacity-90">Treasury Value</div>
              </div>
              <div className="bg-pepu-yellow-orange text-pepu-dark-green p-3 md:p-4 rounded-xl text-center">
                <div className="text-lg md:text-2xl font-bold">14 Days</div>
                <div className="text-xs md:text-sm opacity-90">Snapshot Cycle</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 