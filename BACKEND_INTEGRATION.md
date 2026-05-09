# 🔌 CredLayer Backend Integration Guide

Complete guide for integrating the CredLayer Solana smart contract with your backend API.

---

## 📋 Overview

This guide shows how to connect your Node.js/TypeScript backend to the CredLayer Solana program to:
- Initialize reputation accounts for wallets
- Update trust scores on-chain
- Query reputation data
- Sync on-chain data with your frontend

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

### 2. Set Up Environment Variables

Add to your `.env` file:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Program ID (update after deployment)
CREDLAYER_PROGRAM_ID=CREDqKG3fc8RfScG8uEZP1WoqANgWNJ7o3KG9nfXdUs

# Authority Keypair (keep secure!)
AUTHORITY_PRIVATE_KEY=[1,2,3,...] # Your keypair array
```

### 3. Initialize the Client

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { createCredLayerClient } from './sdk/credlayer-client';

// Load authority keypair from environment
const authorityKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!))
);

// Create connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Create provider
const wallet = new Wallet(authorityKeypair);
const provider = new AnchorProvider(connection, wallet, {
  commitment: 'confirmed',
});

// Create CredLayer client
const credLayerClient = createCredLayerClient(provider);
```

---

## 🔧 Backend API Integration

### API Route: Initialize Reputation

```typescript
// src/routes/api/reputation/initialize.ts
import { createFileRoute } from "@tanstack/react-router";
import { PublicKey } from '@solana/web3.js';
import { credLayerClient } from '@/lib/solana-client';

export const Route = createFileRoute("/api/reputation/initialize")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();
          const { wallet, initialScore } = body;
          
          // Validate input
          if (!wallet || typeof initialScore !== 'number') {
            return Response.json(
              { error: 'Invalid input' },
              { status: 400 }
            );
          }
          
          // Validate score range
          if (initialScore < 0 || initialScore > 100) {
            return Response.json(
              { error: 'Score must be between 0 and 100' },
              { status: 400 }
            );
          }
          
          const walletPubkey = new PublicKey(wallet);
          
          // Check if reputation already exists
          const exists = await credLayerClient.reputationExists(walletPubkey);
          if (exists) {
            return Response.json(
              { error: 'Reputation already exists for this wallet' },
              { status: 409 }
            );
          }
          
          // Initialize reputation on-chain
          const signature = await credLayerClient.initializeReputation(
            walletPubkey,
            initialScore,
            provider.wallet.publicKey,
            provider.wallet.publicKey
          );
          
          return Response.json({
            success: true,
            signature,
            wallet,
            initialScore,
          });
          
        } catch (error) {
          console.error('Initialize reputation error:', error);
          return Response.json(
            { error: 'Failed to initialize reputation' },
            { status: 500 }
          );
        }
      },
    },
  },
});
```

### API Route: Update Reputation

```typescript
// src/routes/api/reputation/update.ts
import { createFileRoute } from "@tanstack/react-router";
import { PublicKey } from '@solana/web3.js';
import { credLayerClient, RiskLevel } from '@/lib/solana-client';
import { analyzeWallet } from '@/lib/reputation-engine';

export const Route = createFileRoute("/api/reputation/update")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();
          const { wallet } = body;
          
          if (!wallet) {
            return Response.json(
              { error: 'Wallet address required' },
              { status: 400 }
            );
          }
          
          const walletPubkey = new PublicKey(wallet);
          
          // Analyze wallet using your reputation engine
          const analysis = analyzeWallet(wallet);
          
          // Map risk level to enum
          const riskLevelMap: Record<string, RiskLevel> = {
            'Highly Trusted': RiskLevel.HighlyTrusted,
            'Trusted': RiskLevel.Trusted,
            'Medium Risk': RiskLevel.MediumRisk,
            'High Risk': RiskLevel.HighRisk,
          };
          
          const riskLevel = riskLevelMap[analysis.risk_level];
          const confidence = Math.round(analysis.confidence * 10000); // Convert to basis points
          
          // Check if reputation exists
          const exists = await credLayerClient.reputationExists(walletPubkey);
          
          let signature: string;
          
          if (!exists) {
            // Initialize if doesn't exist
            signature = await credLayerClient.initializeReputation(
              walletPubkey,
              analysis.trust_score,
              provider.wallet.publicKey,
              provider.wallet.publicKey
            );
          } else {
            // Update existing reputation
            signature = await credLayerClient.updateReputation(
              walletPubkey,
              analysis.trust_score,
              riskLevel,
              confidence
            );
          }
          
          // Update metrics
          for (const metric of analysis.metrics) {
            const metricTypeMap: Record<string, any> = {
              'Behavioral Stability': MetricType.BehavioralStability,
              'Transaction Diversity': MetricType.TransactionDiversity,
              'Counterparty Quality': MetricType.CounterpartyQuality,
              'Smart Contract Hygiene': MetricType.SmartContractHygiene,
              'Sybil Resistance': MetricType.SybilResistance,
              'Repayment Reliability': MetricType.RepaymentReliability,
            };
            
            const metricType = metricTypeMap[metric.label];
            if (metricType) {
              await credLayerClient.addMetric(
                walletPubkey,
                metricType,
                metric.value
              );
            }
          }
          
          // Add risk flags
          for (const flag of analysis.flags) {
            const flagMap: Record<string, RiskFlag> = {
              'potential_sybil_cluster': RiskFlag.PotentialSybilCluster,
              'abnormal_transaction_burst': RiskFlag.AbnormalTransactionBurst,
              'unverified_program_interaction': RiskFlag.UnverifiedProgramInteraction,
              'low_protocol_diversity': RiskFlag.LowProtocolDiversity,
              'elevated_failure_rate': RiskFlag.ElevatedFailureRate,
              'new_wallet': RiskFlag.NewWallet,
              'weak_repayment_history': RiskFlag.WeakRepaymentHistory,
            };
            
            const riskFlag = flagMap[flag];
            if (riskFlag) {
              await credLayerClient.addRiskFlag(walletPubkey, riskFlag);
            }
          }
          
          return Response.json({
            success: true,
            signature,
            ...analysis,
          });
          
        } catch (error) {
          console.error('Update reputation error:', error);
          return Response.json(
            { error: 'Failed to update reputation' },
            { status: 500 }
          );
        }
      },
    },
  },
});
```

### API Route: Get Reputation

```typescript
// src/routes/api/reputation/get.ts
import { createFileRoute } from "@tanstack/react-router";
import { PublicKey } from '@solana/web3.js';
import { credLayerClient } from '@/lib/solana-client';

export const Route = createFileRoute("/api/reputation/get")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const wallet = url.searchParams.get('wallet');
          
          if (!wallet) {
            return Response.json(
              { error: 'Wallet address required' },
              { status: 400 }
            );
          }
          
          const walletPubkey = new PublicKey(wallet);
          
          // Get reputation from on-chain
          const reputation = await credLayerClient.getReputation(walletPubkey);
          
          if (!reputation) {
            return Response.json(
              { error: 'Reputation not found' },
              { status: 404 }
            );
          }
          
          // Format response
          return Response.json({
            wallet: reputation.wallet.toString(),
            trust_score: reputation.trustScore,
            risk_level: reputation.riskLevel,
            confidence: reputation.confidence / 100, // Convert back to percentage
            last_updated: new Date(reputation.lastUpdated * 1000).toISOString(),
            created_at: new Date(reputation.createdAt * 1000).toISOString(),
            update_count: reputation.updateCount,
            metrics: reputation.metrics
              .filter(m => m.metricType !== 'None')
              .map(m => ({
                type: m.metricType,
                value: m.value,
              })),
            risk_flags: reputation.riskFlags
              .filter(f => f !== 'None'),
            active_flags_count: reputation.activeFlagsCount,
          });
          
        } catch (error) {
          console.error('Get reputation error:', error);
          return Response.json(
            { error: 'Failed to get reputation' },
            { status: 500 }
          );
        }
      },
    },
  },
});
```

---

## 🔐 Security Best Practices

### 1. Secure Authority Keypair

**Never commit your private key to Git!**

```typescript
// ❌ BAD - Don't do this
const keypair = Keypair.fromSecretKey(new Uint8Array([1,2,3,...]));

// ✅ GOOD - Load from environment
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!))
);
```

### 2. Use Environment-Specific Keys

```typescript
const getAuthorityKeypair = () => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    // Use production keypair (from secure vault)
    return loadFromVault('PROD_AUTHORITY_KEY');
  } else if (env === 'staging') {
    // Use staging keypair
    return Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.STAGING_AUTHORITY_KEY!))
    );
  } else {
    // Use development keypair
    return Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.DEV_AUTHORITY_KEY!))
    );
  }
};
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const reputationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many reputation requests, please try again later.',
});

app.use('/api/reputation', reputationLimiter);
```

### 4. Input Validation

```typescript
import { z } from 'zod';

const UpdateReputationSchema = z.object({
  wallet: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
  score: z.number().min(0).max(100).optional(),
});

// Use in handler
const parsed = UpdateReputationSchema.safeParse(body);
if (!parsed.success) {
  return Response.json(
    { error: parsed.error.issues },
    { status: 400 }
  );
}
```

---

## 📊 Monitoring & Logging

### Transaction Monitoring

```typescript
import { Connection } from '@solana/web3.js';

async function monitorTransaction(signature: string) {
  const connection = new Connection(process.env.SOLANA_RPC_URL!);
  
  // Wait for confirmation
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  if (confirmation.value.err) {
    console.error('Transaction failed:', confirmation.value.err);
    throw new Error('Transaction failed');
  }
  
  // Get transaction details
  const tx = await connection.getTransaction(signature, {
    commitment: 'confirmed',
  });
  
  console.log('Transaction successful:', {
    signature,
    slot: tx?.slot,
    blockTime: tx?.blockTime,
  });
  
  return tx;
}
```

### Error Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use in handlers
try {
  await credLayerClient.updateReputation(...);
} catch (error) {
  logger.error('Reputation update failed', {
    wallet,
    error: error.message,
    stack: error.stack,
  });
  throw error;
}
```

---

## 🔄 Sync Strategy

### Periodic Sync

```typescript
import cron from 'node-cron';

// Sync every hour
cron.schedule('0 * * * *', async () => {
  console.log('Starting reputation sync...');
  
  try {
    // Get all wallets that need updating
    const wallets = await getWalletsToUpdate();
    
    for (const wallet of wallets) {
      try {
        // Analyze and update on-chain
        const analysis = analyzeWallet(wallet);
        await updateOnChainReputation(wallet, analysis);
        
        console.log(`Updated reputation for ${wallet}`);
      } catch (error) {
        console.error(`Failed to update ${wallet}:`, error);
      }
    }
    
    console.log('Reputation sync complete');
  } catch (error) {
    console.error('Sync failed:', error);
  }
});
```

### Event-Driven Updates

```typescript
// Update reputation when wallet performs an action
async function onWalletTransaction(wallet: string) {
  try {
    // Re-analyze wallet
    const analysis = analyzeWallet(wallet);
    
    // Update on-chain if score changed significantly
    const onChainRep = await credLayerClient.getReputation(
      new PublicKey(wallet)
    );
    
    if (!onChainRep || Math.abs(onChainRep.trustScore - analysis.trust_score) >= 5) {
      await updateOnChainReputation(wallet, analysis);
      console.log(`Reputation updated for ${wallet} due to significant change`);
    }
  } catch (error) {
    console.error('Event-driven update failed:', error);
  }
}
```

---

## 🧪 Testing Backend Integration

### Unit Tests

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { Keypair, PublicKey } from '@solana/web3.js';

describe('CredLayer Backend Integration', () => {
  let testWallet: Keypair;
  
  beforeAll(() => {
    testWallet = Keypair.generate();
  });
  
  it('should initialize reputation', async () => {
    const signature = await credLayerClient.initializeReputation(
      testWallet.publicKey,
      75,
      provider.wallet.publicKey,
      provider.wallet.publicKey
    );
    
    expect(signature).toBeDefined();
    
    const reputation = await credLayerClient.getReputation(testWallet.publicKey);
    expect(reputation?.trustScore).toBe(75);
  });
  
  it('should update reputation', async () => {
    await credLayerClient.updateReputation(
      testWallet.publicKey,
      85,
      RiskLevel.HighlyTrusted,
      9000
    );
    
    const reputation = await credLayerClient.getReputation(testWallet.publicKey);
    expect(reputation?.trustScore).toBe(85);
    expect(reputation?.riskLevel).toBe(RiskLevel.HighlyTrusted);
  });
});
```

---

## 📈 Performance Optimization

### Batch Operations

```typescript
async function batchUpdateReputations(wallets: string[]) {
  const batchSize = 10;
  
  for (let i = 0; i < wallets.length; i += batchSize) {
    const batch = wallets.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (wallet) => {
        try {
          const analysis = analyzeWallet(wallet);
          await updateOnChainReputation(wallet, analysis);
        } catch (error) {
          console.error(`Failed to update ${wallet}:`, error);
        }
      })
    );
    
    // Rate limiting between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### Caching

```typescript
import NodeCache from 'node-cache';

const reputationCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function getCachedReputation(wallet: string) {
  const cached = reputationCache.get(wallet);
  if (cached) {
    return cached;
  }
  
  const reputation = await credLayerClient.getReputation(new PublicKey(wallet));
  if (reputation) {
    reputationCache.set(wallet, reputation);
  }
  
  return reputation;
}
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Authority keypair secured
- [ ] Smart contract deployed to devnet
- [ ] Program ID updated in backend
- [ ] API routes tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] Monitoring set up
- [ ] Documentation updated

---

## 📚 Additional Resources

- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework Guide](https://www.anchor-lang.com/)
- [CredLayer Smart Contract Code](./programs/credlayer/src/)
- [SDK Documentation](./sdk/credlayer-client.ts)

---

## 🆘 Support

For issues or questions:
1. Check the [SOLANA_SETUP.md](./SOLANA_SETUP.md) guide
2. Review error logs
3. Test on devnet first
4. Contact the CredLayer team

---

**Built with 🛡️ by CredLayer Team**
