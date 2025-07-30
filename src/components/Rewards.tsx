'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  balance: number;
  totalRewards: number;
  lastSnapshot: string;
}

export default function Rewards() {
  const [timeUntilNextSnapshot, setTimeUntilNextSnapshot] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, address: '0x8F7F4A2B8C9D1E3F5A7B9C1D3E5F7A9B1C3D5E7F', balance: 2500000, totalRewards: 45000, lastSnapshot: '2024-01-15' },
    { rank: 2, address: '0x1A2B3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B', balance: 1800000, totalRewards: 32000, lastSnapshot: '2024-01-15' },
    { rank: 3, address: '0x2B3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C', balance: 1200000, totalRewards: 28000, lastSnapshot: '2024-01-15' },
    { rank: 4, address: '0x3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C3D', balance: 950000, totalRewards: 22000, lastSnapshot: '2024-01-15' },
    { rank: 5, address: '0x4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C3D4E', balance: 750000, totalRewards: 18000, lastSnapshot: '2024-01-15' },
    { rank: 6, address: '0x5E6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F', balance: 600000, totalRewards: 15000, lastSnapshot: '2024-01-15' },
    { rank: 7, address: '0x6F7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A', balance: 480000, totalRewards: 12000, lastSnapshot: '2024-01-15' },
    { rank: 8, address: '0x7A8B9C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B', balance: 420000, totalRewards: 10000, lastSnapshot: '2024-01-15' },
    { rank: 9, address: '0x8B9C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C', balance: 380000, totalRewards: 8500, lastSnapshot: '2024-01-15' },
    { rank: 10, address: '0x9C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D', balance: 350000, totalRewards: 7500, lastSnapshot: '2024-01-15' }
  ]);

  useEffect(() => {
    const calculateTimeUntilSnapshot = () => {
      const now = new Date();
      const lastSnapshot = new Date('2024-01-15T14:00:00Z');
      const nextSnapshot = new Date(lastSnapshot.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
      const timeDiff = nextSnapshot.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeUntilNextSnapshot('Snapshot due!');
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntilNextSnapshot(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeUntilSnapshot();
    const interval = setInterval(calculateTimeUntilSnapshot, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`;
    }
    if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toString();
  };

  const formatRewards = (rewards: number) => {
    return rewards.toLocaleString();
  };

  return (
    <section id="rewards" className="py-16 bg-gradient-to-br from-pepu-yellow-orange/5 to-pepu-light-green/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-pepu-dark-green mb-4">
            Rewards & Snapshots
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bi-weekly snapshot system that rewards active $Vault holders with automatic PEPU distributions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Snapshot System Explanation */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-pepu-light-green/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-pepu-yellow-orange rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-pepu-dark-green">Snapshot System</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-pepu-light-green/10 rounded-lg">
                  <span className="text-gray-700">Snapshot Frequency</span>
                  <span className="font-bold text-pepu-dark-green">Every 14 Days</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-pepu-yellow-orange/10 rounded-lg">
                  <span className="text-gray-700">Next Snapshot</span>
                  <span className="font-bold text-pepu-yellow-orange">{timeUntilNextSnapshot}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-pepu-dark-green/10 rounded-lg">
                  <span className="text-gray-700">Last Snapshot</span>
                  <span className="font-bold text-pepu-dark-green">January 15, 2024</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <h4 className="font-semibold text-pepu-dark-green mb-2">How It Works</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Snapshots are taken every 14 days automatically</li>
                  <li>• Your $Vault balance at snapshot time determines rewards</li>
                  <li>• Rewards are distributed in PEPU tokens</li>
                  <li>• Higher balances receive proportionally more rewards</li>
                  <li>• No action required - rewards are sent automatically</li>
                </ul>
              </div>
            </div>

            {/* Telegram Updates */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-pepu-light-green/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-pepu-dark-green">Telegram Updates</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Latest Update</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Snapshot #15 completed! 45,000 PEPU distributed to 1,250 holders.
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Previous Update</span>
                    <span className="text-xs text-gray-500">14 days ago</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Snapshot #14: 42,000 PEPU distributed to 1,180 holders.
                  </p>
                </div>
              </div>

              <a 
                href="https://t.me/pepuvault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full mt-4 bg-blue-500 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Join Telegram Channel
              </a>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-pepu-light-green/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-pepu-dark-green">All-Time Leaderboard</h3>
              <div className="text-sm text-gray-500">Top $Vault Holders</div>
            </div>

            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.rank} className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200' :
                  index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200' :
                  index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200' :
                  'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-pepu-dark-green">{formatAddress(entry.address)}</div>
                      <div className="text-xs text-gray-500">{formatBalance(entry.balance)} $Vault</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-pepu-yellow-orange">{formatRewards(entry.totalRewards)} PEPU</div>
                    <div className="text-xs text-gray-500">Rewards</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-pepu-light-green/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Rewards Distributed</span>
                <span className="font-bold text-pepu-dark-green">185,500 PEPU</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Active Holders</span>
                <span className="font-bold text-pepu-yellow-orange">1,250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 