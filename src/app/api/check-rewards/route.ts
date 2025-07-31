import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

interface RewardData {
  wallet: string;
  lastVaultReward: string;
  totalVaultReward: string;
  lastPepuReward: string;
  totalPepuReward: string;
}

// Define the Reward schema
const RewardSchema = new mongoose.Schema({
  wallet: String,
  lastVaultReward: String,
  totalVaultReward: String,
  lastPepuReward: String,
  totalPepuReward: String,
});

// Create or get the model
const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);

export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Validate Ethereum wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Query MongoDB for the wallet
    const rewardData = await Reward.findOne({ wallet: wallet.toLowerCase() });

    if (!rewardData) {
      return NextResponse.json({ 
        error: 'No reward data found for this wallet',
        success: false 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet: rewardData.wallet,
        lastVaultReward: rewardData.lastVaultReward,
        totalVaultReward: rewardData.totalVaultReward,
        lastPepuReward: rewardData.lastPepuReward,
        totalPepuReward: rewardData.totalPepuReward,
      }
    });

  } catch (error) {
    console.error('Error checking rewards:', error);
    return NextResponse.json({ 
      error: 'Failed to check rewards',
      success: false 
    }, { status: 500 });
  }
} 