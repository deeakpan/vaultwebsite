import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import Providers from "./providers";
import VaultGPTButton from "@/components/VaultGPTButton";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
        <ThemeProvider>
          <Providers>
            {children}
            <VaultGPTButton />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
