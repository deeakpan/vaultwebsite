# SuperBridge Integration for Pepe Unchained Vault

This document explains how the SuperBridge component has been integrated into your vault website with vault token restrictions and Pepe Unchained theme.

## Overview

The SuperBridge component has been successfully integrated and customized for your vault website with the following key changes:

- **Vault Restrictions**: Changed from PENK token requirements to VAULT token requirements (3M minimum)
- **Theme Integration**: Uses your Pepe Unchained color scheme and design language
- **Navigation**: Added to header navigation and hero section
- **Self-contained**: No external dependencies, works with your existing setup

## Key Features

### Vault Token Restrictions
- **Minimum Requirement**: 3,000,000 VAULT tokens required to use the bridge
- **Contract Address**: Uses your existing VAULT contract (`0x8746D6Fc80708775461226657a6947497764BBe6`)
- **Balance Display**: Shows current VAULT balance with color coding (green if sufficient, red if insufficient)

### Theme Integration
- **Primary Color**: `#F4A300` (pepu-yellow-orange)
- **Secondary Color**: `#8BC34A` (pepu-light-green)
- **Background**: `#1B4D3E` (pepu-dark-green)
- **Text**: `#FDFCFB` (pepu-white)
- **Design**: Matches your existing component styling and layout

### Network Configuration
- **Chain ID**: 97741 (Pepe Unchained V2)
- **Chain Name**: "Pepe Unchained V2"
- **RPC URL**: `https://rpc-pepu-v2-mainnet-0.t.conduit.xyz`
- **Explorer**: `https://pepuscan.com`

## Files Created/Modified

### New Files
- `src/components/SuperBridge.tsx` - Main SuperBridge component
- `src/app/bridge/page.tsx` - Bridge page route
- `SUPERBRIDGE_INTEGRATION.md` - This documentation

### Modified Files
- `src/components/Header.tsx` - Added bridge navigation link
- `src/components/Hero.tsx` - Added bridge CTA button

## Usage

### Basic Usage
```tsx
import SuperBridge from '@/components/SuperBridge';

function App() {
  return (
    <div>
      <SuperBridge />
    </div>
  );
}
```

### Custom Configuration
```tsx
import SuperBridge from '@/components/SuperBridge';

function App() {
  const customConfig = {
    // Update contract addresses
    l2BridgeContract: "0x1234567890123456789012345678901234567890",
    l1BridgeContract: "0x0987654321098765432109876543210987654321",
    tokenContract: "0x1111111111111111111111111111111111111111",
    
    // Customize vault requirements
    vaultMinimum: 5000000, // 5M instead of 3M
    
    // Customize theme
    primaryColor: "#custom-color",
    secondaryColor: "#custom-color",
  };

  return (
    <div>
      <SuperBridge config={customConfig} />
    </div>
  );
}
```

## Configuration Options

### Required Configuration
| Option | Type | Description |
|--------|------|-------------|
| `l2BridgeContract` | string | `0x0fE9dB3857408402a7C82Dd8b24fB536D5d0c38B` (Pepe Unchained V2) |
| `l1BridgeContract` | string | `0x6D925164B21d24F820d01DA0B8E8f93f16f02317` (Ethereum Mainnet) |
| Note | - | PEPU is the native token, no separate contract needed |

### Vault Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `vaultContract` | string | `0x8746D6Fc80708775461226657a6947497764BBe6` | Your VAULT contract |
| `vaultMinimum` | number | `3000000` | Minimum VAULT tokens required |

### Network Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `chainId` | number | `97741` | Pepe Unchained V2 chain ID |
| `chainName` | string | `"Pepe Unchained V2"` | Chain display name |
| `rpcUrl` | string | Pepe Unchained RPC | RPC endpoint |
| `explorerUrl` | string | `"https://pepuscan.com"` | Block explorer |

### Theme Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `primaryColor` | string | `#F4A300` | Primary accent (pepu-yellow-orange) |
| `secondaryColor` | string | `#8BC34A` | Secondary accent (pepu-light-green) |
| `backgroundColor` | string | `#1B4D3E` | Background (pepu-dark-green) |
| `textColor` | string | `#FDFCFB` | Text (pepu-white) |

## How It Works

1. **Wallet Connection**: Uses native `window.ethereum` for MetaMask and other wallet connections
2. **Vault Balance Check**: Fetches VAULT token balance from your contract
3. **Access Control**: Only allows bridging if user has minimum VAULT tokens (3M)
4. **Bridge Transaction**: Sends bridge transaction to L2 bridge contract
5. **Pool Validation**: Checks if L1 pool has sufficient funds for bridge amount
6. **Transaction Monitoring**: Tracks transaction status and confirms completion

## Security Features

- **Vault Token Validation**: Enforces minimum VAULT holdings
- **Network Validation**: Ensures users are on correct network
- **Balance Checks**: Validates sufficient funds before bridging
- **Pool Validation**: Checks L1 pool liquidity before allowing bridge

## Customization

### Changing Vault Requirements
```tsx
const config = {
  vaultMinimum: 5000000, // Change to 5M tokens
};
```

### Updating Contract Addresses
```tsx
const config = {
  l2BridgeContract: "0xNEW_L2_CONTRACT_ADDRESS",
  l1BridgeContract: "0xNEW_L1_CONTRACT_ADDRESS",
  tokenContract: "0xNEW_TOKEN_CONTRACT_ADDRESS",
};
```

### Custom Theme Colors
```tsx
const config = {
  primaryColor: "#your-primary-color",
  secondaryColor: "#your-secondary-color",
  backgroundColor: "#your-background-color",
  textColor: "#your-text-color",
};
```

## Troubleshooting

### Common Issues

1. **"Failed to connect wallet"**: Ensure MetaMask or similar wallet is installed
2. **"Wrong Network"**: User needs to switch to Pepe Unchained V2 (chain ID 97741)
3. **"Insufficient VAULT balance"**: User needs at least 3M VAULT tokens
4. **"Transaction failed"**: Check contract addresses and network configuration

### Debug Information

The component includes console logging for debugging:
```tsx
console.log('SuperBridge Debug:', {
  config,
  walletState: { address, isConnected, chainId },
  balances: { native: nativeBalance, pepu: pepuBalance, vault: vaultBalance }
});
```

## Next Steps

1. **Test the Bridge**: The bridge is now properly configured for PEPU as the native token
2. **Test on Testnet**: Test the bridge functionality on testnet first
3. **Customize Theme**: Adjust colors and styling to match your exact design requirements
4. **Add Analytics**: Integrate with your existing analytics and tracking systems

## Current Configuration

The SuperBridge is now configured with your actual contract addresses:

- **L2 Bridge Contract**: `0x0fE9dB3857408402a7C82Dd8b24fB536D5d0c38B` (Pepe Unchained V2)
- **L1 Bridge Contract**: `0x6D925164B21d24F820d01DA0B8E8f93f16f02317` (Ethereum Mainnet)
- **VAULT Contract**: `0x8746D6Fc80708775461226657a6947497764BBe6`
- **Vault Minimum**: 3,000,000 VAULT tokens required

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your configuration is correct
3. Ensure you're on the right network (Pepe Unchained V2)
4. Check that contracts are properly deployed and configured

The SuperBridge component is now fully integrated and ready to use with your vault website!
