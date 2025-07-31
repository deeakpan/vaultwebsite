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
    console.log('Reward check API called');
    const { wallet } = await request.json();
    console.log('Wallet address received:', wallet);

    if (!wallet) {
      console.log('No wallet address provided');
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Validate Ethereum wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      console.log('Invalid wallet address format:', wallet);
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('MongoDB URI not found in environment variables');
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    console.log('MongoDB URI found:', process.env.MONGODB_URI.substring(0, 20) + '...');
    console.log('Connecting to MongoDB...');
    
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
      } catch (connectionError) {
        console.error('MongoDB connection error:', connectionError);
        return NextResponse.json({ 
          error: 'Database connection failed. Please check your MongoDB URI format.',
          success: false 
        }, { status: 500 });
      }
    }

    // Query MongoDB for the wallet
    console.log('Querying for wallet:', wallet.toLowerCase());
    const rewardData = await Reward.findOne({ wallet: wallet.toLowerCase() });
    console.log('Query result:', rewardData);

    if (!rewardData) {
      console.log('No reward data found for wallet:', wallet);
      return NextResponse.json({ 
        error: 'No reward data found for this wallet',
        success: false 
      }, { status: 404 });
    }

    console.log('Returning reward data for wallet:', wallet);
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