'use client';

import { useState } from "react";
import VaultGPTModal from "./VaultGPTModal";

export default function VaultGPTButton() {
  const [isVaultGPTOpen, setIsVaultGPTOpen] = useState(false);

  return (
    <>
      {/* Floating VaultGPT Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsVaultGPTOpen(true)}
          className="bg-gradient-to-r from-pepu-dark-green to-pepu-light-green text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold text-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>VaultGPT</span>
        </button>
      </div>

      {/* VaultGPT Modal */}
      <VaultGPTModal 
        isOpen={isVaultGPTOpen} 
        onClose={() => setIsVaultGPTOpen(false)} 
      />
    </>
  );
} 