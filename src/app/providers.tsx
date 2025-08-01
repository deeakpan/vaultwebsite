"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'wagmi';
import { Chain } from 'wagmi/chains';

const pepuChain: Chain = {
  id: 97741,
  name: 'Pepe Unchained V2',
  nativeCurrency: {
    name: 'Pepe Unchained V2',
    symbol: 'PEPU',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc-pepu-v2-mainnet-0.t.conduit.xyz'] },
    public: { http: ['https://rpc-pepu-v2-mainnet-0.t.conduit.xyz'] },
  },
  blockExplorers: {
    default: { name: 'PepuScan', url: 'https://pepuscan.com/' },
  },
  testnet: false,
};

const config = getDefaultConfig({
  appName: 'Pepu Vault',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a67f93628aabda4e00a754a60a815ea3',
  chains: [pepuChain],
  ssr: true,
  transports: {
    [pepuChain.id]: http('https://rpc-pepu-v2-mainnet-0.t.conduit.xyz'),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 