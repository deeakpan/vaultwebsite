'use client';

import { useState, useEffect } from 'react';

interface Partner {
  id?: string;
  name: string;
  description: string;
  link: string;
  logo_url: string;
  created_at?: string;
}

interface DetailsData {
  total: string;
  snapshot: string;
}

export default function Hero() {
  const [detailsData, setDetailsData] = useState<DetailsData>({
    total: '1,250,000',
    snapshot: new Date().toISOString()
  });
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [treasuryValue, setTreasuryValue] = useState('$2.4M');
  const [isLoadingTreasury, setIsLoadingTreasury] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [rewardPartner, setRewardPartner] = useState<Partner | null>(null);
  const [nextAuctionDate, setNextAuctionDate] = useState<Date | null>(null);

  const [timeUntilNextSnapshot, setTimeUntilNextSnapshot] = useState('');

  // Calculate next auction date (every 14 days)
  const calculateNextAuctionDate = () => {
    const now = new Date();
    const snapshotDate = new Date(detailsData.snapshot);
    const nextAuction = new Date(snapshotDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    setNextAuctionDate(nextAuction);
  };

  // Fetch details data
  const fetchDetailsData = async () => {
    try {
      setIsLoadingDetails(true);
      const response = await fetch('/api/details');
      if (response.ok) {
        const data = await response.json();
        setDetailsData(data);
      }
    } catch (error) {
      console.error('Error fetching details data:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Fetch treasury data
  const fetchTreasuryData = async () => {
    try {
      setIsLoadingTreasury(true);
      const response = await fetch('/api/treasury');
      if (response.ok) {
        const data = await response.json();
        if (data.totalValue) {
          setTreasuryValue(`$${(data.totalValue / 1000000).toFixed(1)}M`);
        }
      }
    } catch (error) {
      console.error('Error fetching treasury data:', error);
    } finally {
      setIsLoadingTreasury(false);
    }
  };

  // Fetch partners data
  const fetchPartnersData = async () => {
    try {
      setIsLoadingPartners(true);
      console.log('Fetching partners data...');
      const response = await fetch('/api/partners');
      if (response.ok) {
        const data = await response.json();
        console.log('Partners data received:', data);
        setPartners(data.partners || []);
        
        // Show the latest partner (last row)
        if (data.partners && data.partners.length > 0) {
          console.log('Setting reward partner:', data.partners[0]);
          setRewardPartner(data.partners[0]); // First item is the latest due to DESC order
        } else {
          console.log('No partners found, clearing reward partner');
          setRewardPartner(null);
        }
      } else {
        console.error('Failed to fetch partners:', response.status, response.statusText);
        setRewardPartner(null);
      }
    } catch (error) {
      console.error('Error fetching partners data:', error);
      setRewardPartner(null);
    } finally {
      setIsLoadingPartners(false);
    }
  };

  useEffect(() => {
    fetchDetailsData();
    fetchTreasuryData();
    fetchPartnersData();
  }, []);

  useEffect(() => {
    if (detailsData.snapshot) {
      calculateNextAuctionDate();
    }
  }, [detailsData.snapshot]);

  useEffect(() => {
    const calculateTimeUntilSnapshot = () => {
      const now = new Date();
      const snapshotDate = new Date(detailsData.snapshot);
      const timeDiff = snapshotDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeUntilNextSnapshot('Snapshot due!');
        return;
      }

      // Format snapshot date
      const day = snapshotDate.getDate();
      const month = snapshotDate.getMonth() + 1; // getMonth() returns 0-11
      const year = snapshotDate.getFullYear();
      
      setTimeUntilNextSnapshot(`${day}/${month}/${year}`);
    };

    calculateTimeUntilSnapshot();
    const interval = setInterval(calculateTimeUntilSnapshot, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [detailsData.snapshot]);

  // Check if today is auction day
  const isTodayAuctionDay = () => {
    if (!nextAuctionDate) return false;
    const today = new Date();
    return today.toDateString() === nextAuctionDate.toDateString();
  };

  // Format auction date
  const formatAuctionDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <section className="py-8 md:py-16 lg:py-24">
      <div className="w-full px-0 md:max-w-6xl md:mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Main Content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-accent/20 text-accent px-3 py-2 rounded-full text-xs md:text-sm font-semibold">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                <span>Live on PEPU Chain</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-primary leading-tight">
                Welcome to{' '}
                <span className="text-accent">Pepu Vault</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                The ultimate treasury management and community rewards platform for $Vault holders. 
                Experience the perfect blend of memecoin fun and serious utility.
              </p>
            </div>

            {/* Core Strengths */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg border border-border">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary text-sm md:text-base mb-1">Treasury Management</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">70% established, 10% high-risk, 20% community-voted</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg border border-border">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-pepu-yellow-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary text-sm md:text-base mb-1">Community Rewards</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Next snapshot: {timeUntilNextSnapshot === 'Snapshot due!' ? 'Due now!' : timeUntilNextSnapshot} with automatic PEPU distribution
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg border border-border">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-pepu-light-green rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary text-sm md:text-base mb-1">Active Holders</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">Growing community of dedicated $Vault holders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://pepuswap.com/#/swap?outputCurrency=0x8746d6fc80708775461226657a6947497764bbe6"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-pepu-dark-green text-primary px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors inline-block text-center"
              >
                Buy $Vault
              </a>
              <a 
                href="https://penkmarket.pepubank.net"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pepu-light-green text-primary px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pepu-light-green/90 transition-colors inline-block text-center"
              >
                Buy from L1
              </a>
              <a 
                href="https://superbridge.pepubank.net"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pepu-yellow-orange text-primary px-4 py-2 rounded-lg font-semibold text-sm hover:bg-pepu-yellow-orange/90 transition-colors inline-block text-center"
              >
                Bridge Assets
              </a>
            </div>
          </div>

          {/* Live Data Display */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-2xl shadow-xl border border-border">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">Live Snapshot Activity</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-3 md:p-4 bg-pepu-yellow-orange/10 rounded-lg">
                  <span className="text-muted-foreground text-sm md:text-base">Total Rewards Distributed</span>
                  <span className="font-bold text-pepu-yellow-orange text-sm md:text-base">
                    {isLoadingDetails ? 'Loading...' : `${detailsData.total} PEPU`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 md:p-4 bg-primary/10 rounded-lg">
                  <span className="text-muted-foreground text-sm md:text-base">Next Snapshot</span>
                  <span className="font-bold text-primary text-sm md:text-base">{timeUntilNextSnapshot}</span>
                </div>
              </div>

              {/* Reward Partner Section */}
              {isLoadingPartners ? (
                <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-r from-pepu-yellow-orange/20 to-pepu-light-green/20 rounded-xl border border-pepu-yellow-orange/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-pulse"></div>
                    <span className="text-sm md:text-base font-bold text-primary">Loading Partners...</span>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs md:text-sm text-muted-foreground">Fetching reward partner information...</p>
                  </div>
                </div>
              ) : rewardPartner ? (
                <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-r from-pepu-yellow-orange/20 to-pepu-light-green/20 rounded-xl border border-pepu-yellow-orange/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-pulse"></div>
                    <span className="text-sm md:text-base font-bold text-primary">
                      {timeUntilNextSnapshot === 'Snapshot due!' 
                        ? "Current Reward Partner" 
                        : isTodayAuctionDay() 
                        ? "Today's Reward Partner" 
                        : `Reward Partner (${formatAuctionDate(nextAuctionDate!)})`
                      }
                    </span>
                  </div>
                  <div className="mt-4">
                    {rewardPartner.logo_url && (
                      <div className="w-full h-24 md:h-32 flex items-center justify-center mb-4">
                        <img 
                          src={rewardPartner.logo_url} 
                          alt={rewardPartner.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <h4 className="font-bold text-primary text-sm md:text-base mb-2">
                        {rewardPartner.name}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {rewardPartner.description}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={rewardPartner.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 text-pepu-yellow-orange text-xs md:text-sm font-semibold hover:underline"
                  >
                    Visit Partner →
                  </a>
                </div>
              ) : (
                <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-r from-pepu-yellow-orange/20 to-pepu-light-green/20 rounded-xl border border-pepu-yellow-orange/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-pulse"></div>
                    <span className="text-sm md:text-base font-bold text-primary">
                      {timeUntilNextSnapshot === 'Snapshot due!' 
                        ? "Current Reward Partner" 
                        : "Reward Partner"
                      }
                    </span>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      No reward partner available at this time. Check back soon!
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pepu-light-green rounded-full animate-pulse"></div>
                  <span className="text-xs md:text-sm font-semibold text-primary">Wallet Connection Status</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Connect your wallet to view personalized data</p>
              </div>
              
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pepu-yellow-orange rounded-full animate-pulse"></div>
                  <span className="text-xs md:text-sm font-semibold text-primary">
                    {timeUntilNextSnapshot === 'Snapshot due!' ? 'Due Now!' : timeUntilNextSnapshot}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Next Snapshot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}