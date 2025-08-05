import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    // Vault token contract address
    const VAULT_TOKEN_ADDRESS = '0x8746D6Fc80708775461226657a6947497764BBe6';
    
    // For now, we'll simulate the balance check
    // In a real implementation, you would:
    // 1. Connect to the blockchain (Pepu Chain)
    // 2. Call the vault token contract's balanceOf function
    // 3. Get the actual balance for the given address
    
    // Simulated balance check - replace with actual blockchain call
    const mockBalance = Math.floor(Math.random() * 5000000); // 0-5M tokens
    
    // For testing purposes, you can hardcode a specific balance for your address
    // if (address.toLowerCase() === 'your-test-address') {
    //   mockBalance = 2000000; // 2M tokens for testing
    // }
    
    return NextResponse.json({
      address: address,
      balance: mockBalance,
      tokenAddress: VAULT_TOKEN_ADDRESS,
      tokenSymbol: 'VAULT'
    });

  } catch (error) {
    console.error('Error fetching vault balance:', error);
    return NextResponse.json({ error: 'Failed to fetch vault balance' }, { status: 500 });
  }
} 