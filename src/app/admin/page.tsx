'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Partner {
  id?: string;
  name: string;
  description: string;
  link: string;
  logo_url: string;
  created_at?: string;
}

interface Token {
  id?: string;
  name: string;
  address: string;
  link: string;
  created_at?: string;
}

interface DetailsData {
  total: string;
  snapshot: string;
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [detailsData, setDetailsData] = useState<DetailsData>({
    total: '1,250,000',
    snapshot: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'partners' | 'tokens' | 'details'>('partners');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    logo: null as File | null
  });

  const [tokenFormData, setTokenFormData] = useState({
    name: '',
    address: '',
    link: ''
  });

  const [detailsFormData, setDetailsFormData] = useState({
    total: '',
    snapshot: ''
  });

  const ADMIN_WALLETS = [
    '0xC96694BEA572073D19C41aA9C014Dd3c7C193B8E',
    '0x62942BbBb86482bFA0C064d0262E23Ca04ea99C5'
  ];

  useEffect(() => {
    if (isConnected && address) {
      setIsAuthorized(ADMIN_WALLETS.some(wallet => 
        address.toLowerCase() === wallet.toLowerCase()
      ));
    } else {
      setIsAuthorized(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isAuthorized) {
      fetchPartners();
      fetchTokens();
      fetchDetails();
    }
  }, [isAuthorized]);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const fetchDetails = async () => {
    try {
      const response = await fetch('/api/details');
      if (response.ok) {
        const data = await response.json();
        setDetailsData(data);
        setDetailsFormData({
          total: data.total,
          snapshot: data.snapshot
        });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || []);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setMessage('Unauthorized: Only the admin wallet can add partners');
      return;
    }

    if (!formData.logo || !formData.name || !formData.description || !formData.link) {
      setMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('logo', formData.logo);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('link', formData.link);

      const response = await fetch('/api/partners', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage('Partner added successfully!');
        setFormData({ name: '', description: '', link: '', logo: null });
        setLogoPreview(null);
        fetchPartners();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage('Error adding partner');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setMessage('Unauthorized: Only the admin wallet can add tokens');
      return;
    }

    if (!tokenFormData.name || !tokenFormData.address || !tokenFormData.link) {
      setMessage('Please fill in all token fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenFormData),
      });

      if (response.ok) {
        setMessage('Token added successfully!');
        setTokenFormData({ name: '', address: '', link: '' });
        fetchTokens();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage('Error adding token');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setMessage('Unauthorized: Only the admin wallet can update details');
      return;
    }

    if (!detailsFormData.total || !detailsFormData.snapshot) {
      setMessage('Please fill in all details fields');
      return;
    }

    setIsLoadingDetails(true);
    setMessage('');

    try {
      const response = await fetch('/api/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailsFormData),
      });

      if (response.ok) {
        setMessage('Details updated successfully!');
        fetchDetails();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error updating details');
      console.error('Error:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const removeToken = async (tokenId: string) => {
    if (!isAuthorized) {
      setMessage('Unauthorized: Only the admin wallet can remove tokens');
      return;
    }

    try {
      const response = await fetch(`/api/tokens?id=${tokenId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Token removed successfully!');
        fetchTokens();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage('Error removing token');
      console.error('Error:', error);
    }
  };

  const clearAllTokens = async () => {
    if (!isAuthorized) {
      setMessage('Unauthorized: Only the admin wallet can clear tokens');
      return;
    }

    if (!confirm('Are you sure you want to clear all tokens? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/tokens', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('All tokens cleared successfully!');
        fetchTokens();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage('Error clearing tokens');
      console.error('Error:', error);
    }
  };

  const clearAllVotes = async () => {
    if (!isAuthorized) {
      setMessage('Unauthorized: Only the admin wallet can clear votes');
      return;
    }

    if (!confirm('Are you sure you want to clear all votes? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('All votes cleared successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage('Error clearing votes');
      console.error('Error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pepu-white via-white to-pepu-light-green/10">
        <Header />
        <main className="w-full px-4 py-8 sm:container sm:mx-auto">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-pepu-dark-green mb-4">Admin Panel</h1>
              <p className="text-gray-600 mb-6">Connect your wallet to access the admin panel</p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="bg-pepu-yellow-orange text-pepu-dark-green px-6 py-3 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pepu-white via-white to-pepu-light-green/10">
        <Header />
        <main className="w-full px-4 py-8 sm:container sm:mx-auto">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-pepu-dark-green mb-4">Admin Panel</h1>
              <p className="text-red-600 mb-4">Access Denied</p>
              <p className="text-gray-600">Only the admin wallet can access this panel</p>
              <p className="text-sm text-gray-500 mt-2">Connected: {address}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Header />
      <main className="w-full px-4 py-8 sm:container sm:mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">Manage partners and voting tokens</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="bg-secondary rounded-lg p-1 shadow-sm border border-border max-w-lg w-full">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setActiveTab('partners')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'partners'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Partners
                  </button>
                  <button
                    onClick={() => setActiveTab('tokens')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'tokens'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Voting Tokens
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg mb-6 text-sm ${
                message.includes('Error') || message.includes('Unauthorized') 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              }`}>
                {message}
              </div>
            )}

            {/* Partners Tab */}
            {activeTab === 'partners' && (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-foreground">
                  Partner Logo *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background text-sm"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Upload partner logo (PNG, JPG, GIF)</p>
                  </div>
                  {logoPreview && (
                    <div className="w-16 h-16 border-2 border-border rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Social Link *
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                    placeholder="https://t.me/projectname"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                  placeholder="Enter project description"
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground py-3 px-6 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 text-base"
              >
                {isLoading ? 'Adding Partner...' : 'Add Partner'}
              </button>
            </form>

                {/* Partners List */}
                {partners.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h2 className="text-xl font-bold text-primary mb-4">Current Partners ({partners.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {partners.map((partner) => (
                        <div key={partner.id} className="bg-secondary rounded-lg p-3 border border-border hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            {partner.logo_url && (
                              <div className="w-10 h-10 bg-card rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                                <img 
                                  src={partner.logo_url} 
                                  alt={partner.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-primary text-sm truncate">{partner.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{partner.description}</p>
                              <a 
                                href={partner.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-accent text-xs hover:underline mt-1 inline-block"
                              >
                                Visit Partner
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tokens Tab */}
            {activeTab === 'tokens' && (
              <>
                <form onSubmit={handleTokenSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Token Name *
                      </label>
                      <input
                        type="text"
                        value={tokenFormData.name}
                        onChange={(e) => setTokenFormData({ ...tokenFormData, name: e.target.value })}
                        className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                        placeholder="Enter token name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Contract Address *
                      </label>
                      <input
                        type="text"
                        value={tokenFormData.address}
                        onChange={(e) => setTokenFormData({ ...tokenFormData, address: e.target.value })}
                        className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                        placeholder="0x..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gecko Terminal Link *
                    </label>
                    <input
                      type="url"
                      value={tokenFormData.link}
                      onChange={(e) => setTokenFormData({ ...tokenFormData, link: e.target.value })}
                      className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                      placeholder="https://www.geckoterminal.com/..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent text-accent-foreground py-3 px-6 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 text-base"
                  >
                    {isLoading ? 'Adding Token...' : 'Add Token'}
                  </button>
                </form>

                {/* Tokens List */}
                {tokens.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-primary">Current Tokens ({tokens.length})</h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={clearAllTokens}
                          className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90 transition-colors"
                        >
                          Clear All Tokens
                        </button>
                        <button
                          onClick={clearAllVotes}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                        >
                          Clear All Votes
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {tokens.map((token) => (
                        <div key={token.id} className="bg-secondary rounded-lg p-3 border border-border hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-primary text-sm truncate">{token.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{token.address}</p>
                              <a 
                                href={token.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-accent text-xs hover:underline mt-1 inline-block"
                              >
                                View on GeckoTerminal
                              </a>
                            </div>
                            <button
                              onClick={() => removeToken(token.id!)}
                              className="ml-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs hover:bg-destructive/90 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <>
                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Total Rewards Distributed *
                      </label>
                      <input
                        type="text"
                        value={detailsFormData.total}
                        onChange={(e) => setDetailsFormData({ ...detailsFormData, total: e.target.value })}
                        className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                        placeholder="e.g., 1,250,000"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter the total PEPU rewards distributed (with commas)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Next Snapshot Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={detailsFormData.snapshot}
                        onChange={(e) => setDetailsFormData({ ...detailsFormData, snapshot: e.target.value })}
                        className="w-full p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background placeholder-muted-foreground text-sm"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Set the next snapshot date and time</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoadingDetails}
                    className="w-full bg-accent text-accent-foreground py-3 px-6 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 text-base"
                  >
                    {isLoadingDetails ? 'Updating Details...' : 'Update Details'}
                  </button>
                </form>

                {/* Current Details Display */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h2 className="text-xl font-bold text-primary mb-4">Current Details</h2>
                  <div className="bg-secondary rounded-lg p-4 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-primary text-sm mb-2">Total Rewards Distributed</h3>
                        <p className="text-accent font-mono text-lg">{detailsData.total} PEPU</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary text-sm mb-2">Next Snapshot</h3>
                        <p className="text-accent font-mono text-lg">
                          {new Date(detailsData.snapshot).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 