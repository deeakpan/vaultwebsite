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

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    logo: null as File | null
  });

  const ADMIN_WALLET = '0x62942BbBb86482bFA0C064d0262E23Ca04ea99C5';

  useEffect(() => {
    if (isConnected && address) {
      setIsAuthorized(address.toLowerCase() === ADMIN_WALLET.toLowerCase());
    } else {
      setIsAuthorized(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isAuthorized) {
      fetchPartners();
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
    <div className="min-h-screen bg-gradient-to-br from-pepu-white via-white to-pepu-light-green/10">
      <Header />
      <main className="w-full px-4 py-8 sm:container sm:mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-pepu-dark-green mb-2">Admin Panel</h1>
              <p className="text-gray-600 text-sm">Add new partners to the platform</p>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg mb-6 text-sm ${
                message.includes('Error') || message.includes('Unauthorized') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-700">
                  Partner Logo *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-gray-900 text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload partner logo (PNG, JPG, GIF)</p>
                  </div>
                  {logoPreview && (
                    <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Link *
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="https://t.me/projectname"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Enter project description"
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pepu-yellow-orange text-pepu-dark-green py-3 px-6 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50 text-base"
              >
                {isLoading ? 'Adding Partner...' : 'Add Partner'}
              </button>
            </form>

            {/* Partners List */}
            {partners.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-pepu-dark-green mb-4">Current Partners ({partners.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {partners.map((partner) => (
                    <div key={partner.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        {partner.logo_url && (
                          <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                            <img 
                              src={partner.logo_url} 
                              alt={partner.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-pepu-dark-green text-sm truncate">{partner.name}</h3>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{partner.description}</p>
                          <a 
                            href={partner.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pepu-yellow-orange text-xs hover:underline mt-1 inline-block"
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 