import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pepuChain = {
  id: 97741,
  name: 'Pepe Unchained V2',
  network: 'pepu-v2',
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

export const metadata: Metadata = {
  title: "Pepu Vault - Treasury Management & Community Rewards",
  description: "Decentralized vault for Pepu Chain with treasury management, community rewards, and AI-powered analytics for $Vault holders.",
  keywords: "Pepu Vault, $Vault, treasury, community rewards, blockchain analytics, memecoin",
  authors: [{ name: "Pepu Vault Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        
        {/* Floating VaultGPT Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-gradient-to-r from-pepu-dark-green to-pepu-light-green text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold text-lg flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>VaultGPT</span>
          </button>
        </div>
      </body>
    </html>
  );
}
