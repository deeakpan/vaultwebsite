'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface VaultGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VaultGPTModal({ isOpen, onClose }: VaultGPTModalProps) {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const VAULT_TOKEN_ADDRESS = '0x8746D6Fc80708775461226657a6947497764BBe6';
  const MINIMUM_VAULT_BALANCE = 0; // 1 vault token for testing

  // Get vault token balance directly from blockchain
  const { data: vaultBalance, isLoading: isCheckingBalance } = useBalance({
    address,
    token: VAULT_TOKEN_ADDRESS as `0x${string}`,
  });

  // Check if user has access based on balance
  useEffect(() => {
    if (isConnected && address && vaultBalance) {
      const balance = Number(vaultBalance.formatted);
      const hasEnoughBalance = balance >= MINIMUM_VAULT_BALANCE;
      console.log('Vault balance check:', { 
        balance, 
        minimum: MINIMUM_VAULT_BALANCE, 
        hasAccess: hasEnoughBalance,
        formatted: vaultBalance.formatted,
        value: vaultBalance.value
      });
      setHasAccess(hasEnoughBalance);
    } else if (!isConnected || !address) {
      setHasAccess(false);
    }
  }, [isConnected, address, vaultBalance, MINIMUM_VAULT_BALANCE]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasAccess(false);
      setMessages([]);
      setInputMessage('');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && hasAccess) {
      // Add welcome message only when access is granted
      setMessages([{
        id: '1',
        text: 'Hello! I\'m VaultGPT, your AI assistant for Pepu Vault analytics. I can help you with treasury insights, reward calculations, and market analysis. What would you like to know?',
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, hasAccess]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !hasAccess) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call VaultGPT API
      const response = await fetch('/api/vaultgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          systemPrompt: "You are VaultGPT, a Pepe Unchained token analytics expert. Provide focused analysis on real-time token prices, trading volume, liquidity analysis, and token comparisons. Keep responses concise and data-driven."
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.relevant === false) {
          // Query not relevant to Pepe Unchained
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response,
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // Relevant query with token data
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response,
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      } else {
        // API error
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble analyzing that right now. Please try asking about specific Pepe Unchained tokens, prices, or trading data.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm experiencing technical difficulties. Please try again or ask about Pepe Unchained token analytics.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col border border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pepu-dark-green to-pepu-light-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-pepu-dark-green">VaultGPT</h2>
              <p className="text-xs text-gray-600">AI Analytics Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-black mb-2">Connect Your Wallet</h3>
                <p className="text-sm text-black mb-4">Connect your wallet to access VaultGPT analytics</p>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="bg-pepu-yellow-orange text-pepu-dark-green px-4 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors text-sm"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>
          ) : isCheckingBalance ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-pepu-yellow-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pepu-yellow-orange rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pepu-yellow-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pepu-yellow-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-black mb-2">Checking Vault Balance</h3>
                <p className="text-sm text-black">Verifying your $Vault token balance...</p>
              </div>
            </div>
          ) : !hasAccess ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-black mb-2">Insufficient Vault Balance</h3>
                <p className="text-sm text-black mb-2">You need at least 1,000,000 $Vault tokens to access VaultGPT</p>
                <p className="text-xs text-black mb-3">Current balance: {vaultBalance?.formatted ? Number(vaultBalance.formatted).toLocaleString() : '0'} $Vault</p>
                <a 
                  href="https://pepuswap.com/#/swap?outputCurrency=0x8746D6Fc80708775461226657a6947497764BBe6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-pepu-yellow-orange text-pepu-dark-green px-4 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors text-sm"
                >
                  Buy More $Vault
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        message.sender === 'user'
                          ? 'bg-pepu-yellow-orange text-pepu-dark-green'
                          : 'bg-gray-100 text-black'
                      }`}
                    >
                      <p className="text-xs">{message.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-black px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about vault analytics..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepu-yellow-orange focus:border-transparent text-sm text-black placeholder-black"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-pepu-yellow-orange text-pepu-dark-green px-3 py-2 rounded-lg font-semibold hover:bg-pepu-yellow-orange/90 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 