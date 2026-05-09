#!/bin/bash

# CredLayer Solana Development Environment Setup Script

set -e

echo "🛡️  CredLayer - Solana Development Environment Setup"
echo "=================================================="

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "✅ Rust is already installed: $(rustc --version)"
fi

# Update Rust
echo "📦 Updating Rust..."
rustup update

# Install Solana CLI
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI is not installed. Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
else
    echo "✅ Solana CLI is already installed: $(solana --version)"
fi

# Install Anchor
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor is not installed. Installing Anchor..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
else
    echo "✅ Anchor is already installed: $(anchor --version)"
fi

# Configure Solana for devnet
echo "🌐 Configuring Solana for devnet..."
solana config set --url devnet

# Generate a new keypair if it doesn't exist
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Generating new Solana keypair..."
    solana-keygen new --no-bip39-passphrase
else
    echo "✅ Solana keypair already exists"
fi

# Show wallet address
echo "💼 Your wallet address:"
solana address

# Airdrop SOL for testing (devnet only)
echo "💰 Requesting airdrop (2 SOL)..."
solana airdrop 2 || echo "⚠️  Airdrop failed (rate limit or network issue). Try again later."

# Check balance
echo "💵 Current balance:"
solana balance

# Install Node dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install || yarn install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Build the program: anchor build"
echo "2. Run tests: anchor test"
echo "3. Deploy to devnet: anchor deploy"
echo ""
echo "🛡️  Happy building with CredLayer!"
