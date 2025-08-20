'use client';

import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';

export default function SuperBridge() {
  const { address, isConnected, chainId } = useAccount();
  const [sendAmount, setSendAmount] = useState('');
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [l1PoolBalance, setL1PoolBalance] = useState<string>("0");

  const VAULT_MIN = 1000; // 1K VAULT required for testing
  const isWrongNetwork = isConnected && chainId !== 97741; // Should be on Pepe Unchained V2 (L2)

  // Fetch balances using wagmi hooks
  const { data: pepuBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: 97741,
    query: {
      enabled: !!address,
    },
  });

  const { data: vaultBalance } = useReadContract({
    address: "0x8746D6Fc80708775461226657a6947497764BBe6" as `0x${string}`, // VAULT contract on L2
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    chainId: 97741,
    query: {
      enabled: !!address,
    },
  });

  // Bridge transaction hook
  const { writeContract, isPending: isBridging, error: bridgeError, data: bridgeData } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: bridgeData,
    chainId: 97741,
  });

  // Fetch L1 pool balance immediately (doesn't depend on wallet)
  useEffect(() => {
    fetchL1PoolBalance();
  }, []);

  // Handle bridge transaction results
  useEffect(() => {
    if (bridgeError) {
      setTxError(bridgeError.message || 'Bridge transaction failed');
      setTxSuccess(null);
    }
  }, [bridgeError]);

  // Handle successful bridge transaction
  useEffect(() => {
    if (isConfirmed && bridgeData) {
      setTxSuccess(`Bridge transaction confirmed! Hash: ${bridgeData.slice(0, 10)}...`);
      setSendAmount('');
      setTxError(null);
    }
  }, [isConfirmed, bridgeData]);

  const fetchL1PoolBalance = async () => {
    // Always fetch L1 pool balance using Alchemy Ethereum RPC
    try {
      // Use Alchemy Ethereum mainnet RPC to check L1 pool balance
      const response = await fetch('https://eth-mainnet.g.alchemy.com/v2/Zj42cvHNG7zOiwgFh5pRLm7HNFAUlvzq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: "0x93aA0ccD1e5628d3A841C4DbdF602D9eb04085d6", // L1 PEPU token contract
            data: "0x70a08231" + "000000000000000000000000" + "0x6D925164B21d24F820d01DA0B8E8f93f16f02317".slice(2),
          }, "latest"],
          id: 1,
        }),
      });
      
      const result = await response.json();
      console.log('L1 Pool Balance Response:', result); // Debug log
      
      if (result.result) {
        const balanceInTokens = (parseInt(result.result, 16) / 10 ** 18).toFixed(6);
        setL1PoolBalance(balanceInTokens);
        console.log('L1 Pool Balance Set:', balanceInTokens); // Debug log
      } else {
        console.error('L1 Pool Balance Error:', result.error);
        setL1PoolBalance("Error");
      }
    } catch (error) {
      console.error("Failed to fetch L1 pool balance:", error);
      setL1PoolBalance("Error");
    }
  };

  const handleBridge = async () => {
    if (!isConnected || !address) {
      setTxError('Please connect your wallet');
      return;
    }

    if (isWrongNetwork) {
      setTxError('Please switch to Pepe Unchained V2');
      return;
    }

    if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      setTxError('Please enter a valid amount');
      return;
    }

    if (!vaultBalance || Number(vaultBalance) < VAULT_MIN * 10 ** 18) {
      setTxError(`Minimum VAULT hold to bridge: ${VAULT_MIN.toLocaleString()}`);
      return;
    }

    if (!pepuBalance || Number(sendAmount) > Number(pepuBalance.formatted)) {
      setTxError('Amount exceeds wallet balance');
      return;
    }

    const bridgeAmount = Number(sendAmount) * 0.95;
    if (bridgeAmount > Number(l1PoolBalance)) {
      setTxError(`Insufficient pool funds. Try a smaller amount.`);
      return;
    }

    setTxError(null);

    // Use wagmi writeContract to send bridge transaction
    writeContract({
      address: "0x0fE9dB3857408402a7C82Dd8b24fB536D5d0c38B" as `0x${string}`, // L2 bridge contract
      abi: [{ 
        type: 'function', 
        name: 'bridge', 
        inputs: [], 
        outputs: [], 
        stateMutability: 'payable' 
      }],
      functionName: 'bridge',
      value: BigInt(Math.floor(Number(sendAmount) * 10 ** 18)),
      chainId: 97741,
    });
  };

  const isBridgeDisabled = !isConnected || isWrongNetwork || isBridging || !sendAmount || Number(sendAmount) <= 0 || !vaultBalance || Number(vaultBalance) < VAULT_MIN * 10 ** 18;

  return (
    <div className="bg-pepu-dark-green border-2 border-pepu-yellow-orange rounded-xl p-6 max-w-md w-full mx-auto">
      <h2 className="text-center text-2xl font-bold text-pepu-yellow-orange mb-6">Bridge Assets</h2>
      
      {isWrongNetwork && (
        <div className="bg-red-500/80 border border-red-400 rounded-lg p-3 mb-4 text-red-100 text-sm text-center">
          ⚠️ Wrong Network - Switch to Pepe Unchained V2
        </div>
      )}

      <div className="mb-4 text-center text-pepu-white text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>L1 Pool:</span>
          <span className="font-bold text-pepu-yellow-orange">{l1PoolBalance} PEPU</span>
          <button 
            onClick={fetchL1PoolBalance}
            className="text-xs bg-pepu-light-green text-pepu-dark-green px-2 py-1 rounded hover:bg-pepu-light-green/80"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="text-xs text-pepu-white/70">
          Available for withdrawals
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-pepu-white text-sm mb-2">Amount to Bridge</label>
        <input
          type="number"
          className="w-full bg-transparent border border-pepu-yellow-orange rounded-lg p-2 text-pepu-white text-base outline-none"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          min="0"
          step="any"
          disabled={!isConnected || isWrongNetwork}
          placeholder="Enter amount"
        />
        <div className="flex justify-between text-xs mt-2 text-pepu-white">
          <span>L2 PEPU: {pepuBalance?.formatted || '0'}</span>
          <span>L2 VAULT: {vaultBalance ? (Number(vaultBalance) / 10 ** 18).toFixed(0) : '0'}</span>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center text-pepu-white text-sm">
          Please connect your wallet using the button in the header
        </div>
      ) : (
        <button
          className={`w-full font-bold py-3 rounded-lg border border-pepu-yellow-orange transition-all ${
            isBridgeDisabled 
              ? 'cursor-not-allowed bg-gray-600 text-gray-400' 
              : 'cursor-pointer bg-pepu-light-green text-pepu-yellow-orange hover:bg-pepu-light-green/90'
          }`}
          disabled={isBridgeDisabled}
          onClick={handleBridge}
        >
          {isBridging ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-pepu-dark-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Bridging...</span>
            </div>
          ) : (
            'Bridge Assets'
          )}
        </button>
      )}

      {txError && (
        <div className="text-red-400 text-sm mt-4 text-center">{txError}</div>
      )}

      {txSuccess && (
        <div className="text-green-400 text-sm mt-4 text-center">{txSuccess}</div>
      )}

      <div className="text-center text-pepu-white text-xs mt-6 opacity-60">
        Powered by <span className="text-pepu-yellow-orange font-bold">SuperBridge</span>
      </div>
    </div>
  );
}
