'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  type: 'whale' | 'launch' | 'snapshot' | 'alert' | 'signal';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
}

interface RailwayNewsResponse {
  date: string;
  status: string;
  tweet: string;
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data: RailwayNewsResponse = await response.json();
      
      if (data.status === 'success' && data.tweet) {
        // Parse the tweet content and create news items
        const parsedNews = parseTweetToNews(data.tweet, data.date);
        setNewsItems(parsedNews);
        setIsConnected(true);
        setLastUpdate(formatTimestamp(data.date));
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
      setIsConnected(false);
      // Fallback to some default news if API fails
      setNewsItems(getFallbackNews());
    } finally {
      setIsLoading(false);
    }
  };

  const parseTweetToNews = (tweet: string, date: string): NewsItem[] => {
    // Split tweet by double newlines to get individual news items
    const newsSections = tweet.split('\\n\\n').filter(section => section.trim());
    
    return newsSections.map((section, index) => {
      // Extract emoji and content
      const emojiMatch = section.match(/^[^\w]*/);
      const emoji = emojiMatch ? emojiMatch[0] : '';
      const content = section.replace(/^[^\w]*/, '').trim();
      
      // Determine type based on emoji or content
      let type: 'whale' | 'launch' | 'snapshot' | 'alert' | 'signal' = 'alert';
      if (emoji.includes('🐋') || content.toLowerCase().includes('whale')) type = 'whale';
      else if (emoji.includes('🚀') || content.toLowerCase().includes('launch')) type = 'launch';
      else if (emoji.includes('📊') || content.toLowerCase().includes('data')) type = 'snapshot';
      else if (emoji.includes('💡') || content.toLowerCase().includes('innovation')) type = 'signal';
      
      // Determine priority based on content
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (content.toLowerCase().includes('alert') || content.toLowerCase().includes('urgent')) priority = 'high';
      else if (content.toLowerCase().includes('update') || content.toLowerCase().includes('news')) priority = 'medium';
      else priority = 'low';
      
      return {
        id: `railway-${index}`,
        type,
        title: content.split('.')[0] || 'Crypto News Update',
        description: content,
        timestamp: formatTimestamp(date),
        priority
      };
    });
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFallbackNews = (): NewsItem[] => [
    {
      id: 'fallback-1',
      type: 'alert',
      title: 'News Service Temporarily Unavailable',
      description: 'Unable to fetch latest news. Please try again later.',
      timestamp: 'Just now',
      priority: 'medium'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whale':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'launch':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'snapshot':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'signal':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whale':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'launch':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'snapshot':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'alert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'signal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <section id="news" className="py-16 bg-gradient-to-br from-pepu-dark-green/5 to-pepu-yellow-orange/5">
      <div className="w-full px-0 md:max-w-6xl md:mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-pepu-dark-green mb-4">
            News & Signals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time alerts and signals powered by Pepex-AI. Stay informed about whale movements, 
            new token launches, and market opportunities on PEPU Chain.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-pepu-light-green/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pepu-yellow-orange to-pepu-light-green rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-pepu-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-pepu-dark-green">Pepex-AI Live Feed</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Last Update</div>
                  <div className="text-sm font-semibold text-pepu-dark-green">{lastUpdate}</div>
                  <button 
                    onClick={fetchNews}
                    disabled={isLoading}
                    className="mt-1 text-xs text-pepu-yellow-orange hover:text-pepu-yellow-orange/80 disabled:opacity-50 disabled:cursor-not-allowed underline"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pepu-yellow-orange"></div>
                    <span className="ml-3 text-gray-600">Loading latest news...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-700">{error}</span>
                    </div>
                    <button 
                      onClick={fetchNews}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : newsItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No news available at the moment
                  </div>
                ) : (
                  newsItems.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-pepu-dark-green">{item.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{item.timestamp}</span>
                            {item.link && (
                              <a 
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-pepu-yellow-orange hover:underline"
                              >
                                View Details
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-pepu-light-green/20 to-pepu-yellow-orange/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-pepu-dark-green">Pepex-AI Status</span>
                  <span className="text-sm text-gray-600">Monitoring PEPU Chain</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Real-time alerts for whale movements, new launches, and market signals
                </p>
              </div>
            </div>
          </div>

          {/* Alert Types & Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-pepu-light-green/20">
              <h3 className="text-lg font-bold text-pepu-dark-green mb-4">Alert Types</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-pepu-dark-green">Whale Movements</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-pepu-dark-green">New Token Launches</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-pepu-dark-green">Snapshot Alerts</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-pepu-dark-green">High Volume Alerts</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-pepu-dark-green">Trading Signals</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-pepu-light-green/20">
              <h3 className="text-lg font-bold text-pepu-dark-green mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total News Items</span>
                  <span className="font-bold text-pepu-dark-green">{newsItems.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Whale Alerts</span>
                  <span className="font-bold text-pepu-yellow-orange">{newsItems.filter(item => item.type === 'whale').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">High Priority</span>
                  <span className="font-bold text-red-500">{newsItems.filter(item => item.priority === 'high').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="font-bold text-pepu-light-green">{lastUpdate || 'Never'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Get Notifications</h3>
              <p className="text-sm opacity-90 mb-4">
                Never miss important alerts. Get notified instantly about whale movements and opportunities.
              </p>
              <button className="w-full bg-pepu-yellow-orange text-pepu-dark-green py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors">
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 