# 🛡️ CredLayer Solana Smart Contract Setup Guide

Complete guide to set up, build, test, and deploy the CredLayer reputation protocol on Solana.

---

## 📋 Prerequisites

- **Operating System**: Linux, macOS, or WSL2 on Windows
- **Node.js**: v18 or higher
- **Rust**: Latest stable version
- **Git**: For version control

---

## 🚀 Quick Start

### 1. Run the Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will:
- ✅ Install Rust and Cargo
- ✅ Install Solana CLI
- ✅ Install Anchor Framework
- ✅ Configure Solana for devnet
- ✅ Generate a keypair
- ✅ Request airdrop for testing
- ✅ Install Node.js dependencies

### 2. Build the Program

```bash
anchor build
```

### 3. Run Tests

```bash
anchor test
```

### 4. Deploy to Devnet

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh devnet
```

---

## 📦 Manual Installation

If you prefer to install components manually:

### Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup update
```

### Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Verify installation:
```bash
solana --version
```

### Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

Verify installation:
```bash
anchor --version
```

### Configure Solana

```bash
# Set cluster to devnet
solana config set --url devnet

# Generate keypair (if you don't have one)
solana-keygen new --no-bip39-passphrase

# Check your address
solana address

# Request airdrop (devnet only)
solana airdrop 2

# Check balance
solana balance
```

---

## 🏗️ Project Structure

```
credlayer/
├── programs/
│   └── credlayer/
│       ├── src/
│       │   ├── lib.rs                 # Main program entry
│       │   ├── constants.rs           # Program constants
│       │   ├── errors.rs              # Custom errors
│       │   ├── state/
│       │   │   ├── mod.rs
│       │   │   └── reputation.rs      # Reputation account structure
│       │   └── instructions/
│       │       ├── mod.rs
│       │       ├── initialize_reputation.rs
│       │       ├── update_reputation.rs
│       │       ├── add_metric.rs
│       │       ├── add_risk_flag.rs
│       │       ├── remove_risk_flag.rs
│       │       └── close_reputation.rs
│       ├── Cargo.toml
│       └── Xargo.toml
├── tests/
│   └── credlayer.ts               # Integration tests
├── sdk/
│   └── credlayer-client.ts        # TypeScript SDK
├── scripts/
│   ├── setup.sh                   # Setup script
│   └── deploy.sh                  # Deployment script
├── Anchor.toml                    # Anchor configuration
├── Cargo.toml                     # Workspace configuration
└── package.json                   # Node dependencies
```

---

## 🔧 Development Workflow

### 1. Build the Program

```bash
anchor build
```

This compiles the Rust program and generates:
- `target/deploy/credlayer.so` - The compiled program
- `target/idl/credlayer.json` - The IDL (Interface Definition Language)
- `target/types/credlayer.ts` - TypeScript types

### 2. Run Tests

```bash
# Run all tests
anchor test

# Run tests with logs
anchor test -- --nocapture

# Run specific test
anchor test -- --test test_name
```

### 3. Local Development

Start a local validator:
```bash
solana-test-validator
```

In another terminal, deploy locally:
```bash
anchor deploy --provider.cluster localnet
```

### 4. Deploy to Devnet

```bash
# Using the deployment script
./scripts/deploy.sh devnet

# Or manually
solana config set --url devnet
anchor build
anchor deploy
```

### 5. Deploy to Mainnet

```bash
# ⚠️ WARNING: This deploys to production!
./scripts/deploy.sh mainnet
```

---

## 📝 Smart Contract Functions

### Initialize Reputation

Creates a new reputation account for a wallet.

```typescript
await program.methods
  .initializeReputation(75) // initial score
  .accounts({
    reputation: reputationPda,
    wallet: walletPublicKey,
    authority: authorityPublicKey,
    payer: payerPublicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Update Reputation

Updates the trust score and risk level.

```typescript
await program.methods
  .updateReputation(
    85,                          // new score
    { highlyTrusted: {} },       // risk level
    9000                         // confidence (90%)
  )
  .accounts({
    reputation: reputationPda,
    authority: authorityPublicKey,
  })
  .rpc();
```

### Add Metric

Adds or updates a behavioral metric.

```typescript
await program.methods
  .addMetric(
    { behavioralStability: {} }, // metric type
    92                           // value (0-100)
  )
  .accounts({
    reputation: reputationPda,
    authority: authorityPublicKey,
  })
  .rpc();
```

### Add Risk Flag

Adds a risk flag to the reputation.

```typescript
await program.methods
  .addRiskFlag({ newWallet: {} })
  .accounts({
    reputation: reputationPda,
    authority: authorityPublicKey,
  })
  .rpc();
```

### Remove Risk Flag

Removes a risk flag from the reputation.

```typescript
await program.methods
  .removeRiskFlag({ newWallet: {} })
  .accounts({
    reputation: reputationPda,
    authority: authorityPublicKey,
  })
  .rpc();
```

### Close Reputation

Closes the reputation account and reclaims rent.

```typescript
await program.methods
  .closeReputation()
  .accounts({
    reputation: reputationPda,
    authority: authorityPublicKey,
  })
  .rpc();
```

---

## 🔌 Using the SDK

### Installation

```typescript
import { createCredLayerClient, RiskLevel, MetricType } from './sdk/credlayer-client';
import { AnchorProvider } from '@coral-xyz/anchor';
```

### Initialize Client

```typescript
const provider = AnchorProvider.env();
const client = createCredLayerClient(provider);
```

### Initialize Reputation

```typescript
const walletPubkey = new PublicKey("...");
const tx = await client.initializeReputation(
  walletPubkey,
  75,                           // initial score
  provider.wallet.publicKey,    // authority
  provider.wallet.publicKey     // payer
);
```

### Get Reputation

```typescript
const reputation = await client.getReputation(walletPubkey);
if (reputation) {
  console.log("Trust Score:", reputation.trustScore);
  console.log("Risk Level:", reputation.riskLevel);
  console.log("Confidence:", reputation.confidence / 100, "%");
}
```

### Update Reputation

```typescript
await client.updateReputation(
  walletPubkey,
  85,
  RiskLevel.HighlyTrusted,
  9000
);
```

### Add Metrics

```typescript
await client.addMetric(
  walletPubkey,
  MetricType.BehavioralStability,
  92
);
```

---

## 🧪 Testing

### Run All Tests

```bash
anchor test
```

### Test Coverage

The test suite includes:
- ✅ Initialize reputation account
- ✅ Update reputation score
- ✅ Add behavioral metrics
- ✅ Add/remove risk flags
- ✅ Multiple metrics handling
- ✅ Invalid score validation
- ✅ Unauthorized access prevention
- ✅ Close reputation account

### Writing Custom Tests

Add tests in `tests/credlayer.ts`:

```typescript
it("Your test name", async () => {
  // Your test code
  const tx = await program.methods
    .yourMethod()
    .accounts({...})
    .rpc();
    
  // Assertions
  expect(result).to.equal(expected);
});
```

---

## 🔐 Security Considerations

### PDA (Program Derived Address)

Reputation accounts use PDAs for security:
- Seeds: `["reputation", wallet_pubkey]`
- Only the authority can update reputation
- Prevents unauthorized modifications

### Account Validation

All instructions include:
- Authority verification
- Input validation (score 0-100, confidence 0-10000)
- Overflow checks
- Maximum limits (flags, metrics)

### Best Practices

1. **Never share your private key**
2. **Test on devnet first**
3. **Verify program ID before deployment**
4. **Use multisig for mainnet authority**
5. **Audit code before mainnet deployment**

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
anchor clean
anchor build
```

### Test Failures

```bash
# Check Solana version compatibility
solana --version
anchor --version

# Update Anchor
avm install latest
avm use latest
```

### Deployment Issues

```bash
# Check balance
solana balance

# Request airdrop (devnet)
solana airdrop 2

# Verify cluster
solana config get
```

### Common Errors

**Error: Insufficient funds**
```bash
solana airdrop 2
```

**Error: Account already exists**
- The reputation account is already initialized
- Use update instead of initialize

**Error: Unauthorized**
- Ensure you're using the correct authority keypair
- Check that the signer matches the authority in the account

---

## 📚 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/tests)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `anchor test`
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🛡️ CredLayer Team

Built with ❤️ for the Solana ecosystem

For questions or support, reach out to the team!
