#!/bin/bash

# CredLayer Deployment Script

set -e

echo "🛡️  CredLayer - Deployment Script"
echo "=================================="

# Check which network to deploy to
NETWORK=${1:-devnet}

echo "📡 Deploying to: $NETWORK"

# Configure Solana cluster
case $NETWORK in
  localnet)
    solana config set --url localhost
    ;;
  devnet)
    solana config set --url devnet
    ;;
  mainnet)
    solana config set --url mainnet-beta
    echo "⚠️  WARNING: Deploying to MAINNET!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Deployment cancelled."
      exit 1
    fi
    ;;
  *)
    echo "❌ Invalid network. Use: localnet, devnet, or mainnet"
    exit 1
    ;;
esac

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💵 Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "⚠️  Low balance! You may need more SOL for deployment."
    if [ "$NETWORK" == "devnet" ]; then
        echo "💰 Requesting airdrop..."
        solana airdrop 2 || echo "Airdrop failed. Please fund your wallet manually."
    fi
fi

# Build the program
echo "🔨 Building program..."
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/credlayer-keypair.json)
echo "📝 Program ID: $PROGRAM_ID"

# Update Anchor.toml with program ID if needed
echo "📝 Updating Anchor.toml..."
sed -i.bak "s/credlayer = \".*\"/credlayer = \"$PROGRAM_ID\"/" Anchor.toml

# Deploy
echo "🚀 Deploying program..."
anchor deploy --provider.cluster $NETWORK

# Verify deployment
echo "✅ Verifying deployment..."
solana program show $PROGRAM_ID

echo ""
echo "✅ Deployment complete!"
echo "📝 Program ID: $PROGRAM_ID"
echo "🌐 Network: $NETWORK"
echo ""
echo "Next steps:"
echo "1. Update your frontend with the new program ID"
echo "2. Initialize reputation accounts for wallets"
echo "3. Test the integration"
