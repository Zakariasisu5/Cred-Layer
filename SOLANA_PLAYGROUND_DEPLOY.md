# 🚀 Deploy CredLayer Contract via Solana Playground

## Step-by-Step Guide

### 1. Open Solana Playground

Go to: **https://beta.solpg.io/**

### 2. Create New Anchor Project

1. Click **"Create a new project"**
2. Select **"Anchor"** template
3. Name it: **"credlayer"**
4. Click **"Create"**

### 3. Replace Files with CredLayer Code

The playground will create a default project. Replace the files with CredLayer code:

#### **File: `lib.rs`** (Main program file)

Delete the default code and paste:

```rust
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("CREDqKG3fc8RfScG8uEZP1WoqANgWNJ7o3KG9nfXdUs");

#[program]
pub mod credlayer {
    use super::*;

    pub fn initialize_reputation(
        ctx: Context<InitializeReputation>,
        initial_score: u16,
    ) -> Result<()> {
        instructions::initialize_reputation::handler(ctx, initial_score)
    }

    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        new_score: u16,
        risk_level: RiskLevel,
        confidence: u16,
    ) -> Result<()> {
        instructions::update_reputation::handler(ctx, new_score, risk_level, confidence)
    }

    pub fn add_metric(
        ctx: Context<AddMetric>,
        metric_type: MetricType,
        value: u16,
    ) -> Result<()> {
        instructions::add_metric::handler(ctx, metric_type, value)
    }

    pub fn add_risk_flag(
        ctx: Context<AddRiskFlag>,
        flag: RiskFlag,
    ) -> Result<()> {
        instructions::add_risk_flag::handler(ctx, flag)
    }

    pub fn remove_risk_flag(
        ctx: Context<RemoveRiskFlag>,
        flag: RiskFlag,
    ) -> Result<()> {
        instructions::remove_risk_flag::handler(ctx, flag)
    }

    pub fn close_reputation(
        ctx: Context<CloseReputation>,
    ) -> Result<()> {
        instructions::close_reputation::handler(ctx)
    }
}
```

#### **Create New Files**

In Solana Playground, create these files by clicking the **"+"** button:

**File: `constants.rs`**
```rust
use anchor_lang::prelude::*;

pub const REPUTATION_SEED: &[u8] = b"reputation";
pub const MAX_RISK_FLAGS: usize = 10;
pub const MAX_METRICS: usize = 6;
pub const MIN_TRUST_SCORE: u16 = 0;
pub const MAX_TRUST_SCORE: u16 = 100;
pub const MAX_CONFIDENCE: u16 = 10000;
pub const REPUTATION_VERSION: u8 = 1;
```

**File: `errors.rs`**
```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum CredLayerError {
    #[msg("Trust score must be between 0 and 100")]
    InvalidTrustScore,
    #[msg("Confidence value exceeds maximum allowed")]
    InvalidConfidence,
    #[msg("Maximum number of risk flags reached")]
    MaxRiskFlagsReached,
    #[msg("Maximum number of metrics reached")]
    MaxMetricsReached,
    #[msg("Risk flag not found")]
    RiskFlagNotFound,
    #[msg("Metric type not found")]
    MetricNotFound,
    #[msg("Unauthorized: Only the authority can perform this action")]
    Unauthorized,
    #[msg("Invalid metric value")]
    InvalidMetricValue,
    #[msg("Reputation account already initialized")]
    AlreadyInitialized,
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
}
```

**File: `state.rs`**
```rust
use anchor_lang::prelude::*;
use crate::constants::*;

#[account]
pub struct ReputationAccount {
    pub version: u8,
    pub wallet: Pubkey,
    pub authority: Pubkey,
    pub trust_score: u16,
    pub risk_level: RiskLevel,
    pub confidence: u16,
    pub last_updated: i64,
    pub created_at: i64,
    pub update_count: u64,
    pub metrics: [Metric; MAX_METRICS],
    pub risk_flags: [RiskFlag; MAX_RISK_FLAGS],
    pub active_flags_count: u8,
    pub bump: u8,
}

impl ReputationAccount {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 2 + 1 + 2 + 8 + 8 + 8 + 
        (Metric::LEN * MAX_METRICS) + (RiskFlag::LEN * MAX_RISK_FLAGS) + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RiskLevel {
    HighlyTrusted,
    Trusted,
    MediumRisk,
    HighRisk,
}

impl Default for RiskLevel {
    fn default() -> Self {
        RiskLevel::MediumRisk
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct Metric {
    pub metric_type: MetricType,
    pub value: u16,
}

impl Metric {
    pub const LEN: usize = 1 + 2;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MetricType {
    None,
    BehavioralStability,
    TransactionDiversity,
    CounterpartyQuality,
    SmartContractHygiene,
    SybilResistance,
    RepaymentReliability,
}

impl Default for MetricType {
    fn default() -> Self {
        MetricType::None
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RiskFlag {
    None,
    PotentialSybilCluster,
    AbnormalTransactionBurst,
    UnverifiedProgramInteraction,
    LowProtocolDiversity,
    ElevatedFailureRate,
    NewWallet,
    WeakRepaymentHistory,
}

impl Default for RiskFlag {
    fn default() -> Self {
        RiskFlag::None
    }
}

impl RiskFlag {
    pub const LEN: usize = 1;
}
```

**File: `instructions.rs`**
```rust
use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

// Initialize Reputation
#[derive(Accounts)]
pub struct InitializeReputation<'info> {
    #[account(
        init,
        payer = payer,
        space = ReputationAccount::LEN,
        seeds = [REPUTATION_SEED, wallet.key().as_ref()],
        bump
    )]
    pub reputation: Account<'info, ReputationAccount>,
    /// CHECK: Wallet we're creating reputation for
    pub wallet: AccountInfo<'info>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub mod initialize_reputation {
    use super::*;
    pub fn handler(ctx: Context<InitializeReputation>, initial_score: u16) -> Result<()> {
        require!(initial_score <= MAX_TRUST_SCORE, CredLayerError::InvalidTrustScore);
        let reputation = &mut ctx.accounts.reputation;
        let clock = Clock::get()?;
        reputation.version = REPUTATION_VERSION;
        reputation.wallet = ctx.accounts.wallet.key();
        reputation.authority = ctx.accounts.authority.key();
        reputation.trust_score = initial_score;
        reputation.risk_level = match initial_score {
            81..=100 => RiskLevel::HighlyTrusted,
            61..=80 => RiskLevel::Trusted,
            31..=60 => RiskLevel::MediumRisk,
            _ => RiskLevel::HighRisk,
        };
        reputation.confidence = 5000;
        reputation.last_updated = clock.unix_timestamp;
        reputation.created_at = clock.unix_timestamp;
        reputation.update_count = 0;
        reputation.metrics = [Metric::default(); MAX_METRICS];
        reputation.risk_flags = [RiskFlag::None; MAX_RISK_FLAGS];
        reputation.active_flags_count = 0;
        reputation.bump = ctx.bumps.reputation;
        Ok(())
    }
}

// Update Reputation
#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, reputation.wallet.as_ref()],
        bump = reputation.bump,
        has_one = authority @ CredLayerError::Unauthorized
    )]
    pub reputation: Account<'info, ReputationAccount>,
    pub authority: Signer<'info>,
}

pub mod update_reputation {
    use super::*;
    pub fn handler(ctx: Context<UpdateReputation>, new_score: u16, risk_level: RiskLevel, confidence: u16) -> Result<()> {
        require!(new_score <= MAX_TRUST_SCORE, CredLayerError::InvalidTrustScore);
        require!(confidence <= MAX_CONFIDENCE, CredLayerError::InvalidConfidence);
        let reputation = &mut ctx.accounts.reputation;
        let clock = Clock::get()?;
        reputation.trust_score = new_score;
        reputation.risk_level = risk_level;
        reputation.confidence = confidence;
        reputation.last_updated = clock.unix_timestamp;
        reputation.update_count = reputation.update_count.checked_add(1).ok_or(CredLayerError::ArithmeticOverflow)?;
        Ok(())
    }
}

// Add Metric
#[derive(Accounts)]
pub struct AddMetric<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, reputation.wallet.as_ref()],
        bump = reputation.bump,
        has_one = authority @ CredLayerError::Unauthorized
    )]
    pub reputation: Account<'info, ReputationAccount>,
    pub authority: Signer<'info>,
}

pub mod add_metric {
    use super::*;
    pub fn handler(ctx: Context<AddMetric>, metric_type: MetricType, value: u16) -> Result<()> {
        require!(value <= 100, CredLayerError::InvalidMetricValue);
        let reputation = &mut ctx.accounts.reputation;
        let mut found = false;
        for metric in reputation.metrics.iter_mut() {
            if metric.metric_type == metric_type || metric.metric_type == MetricType::None {
                metric.metric_type = metric_type;
                metric.value = value;
                found = true;
                break;
            }
        }
        require!(found, CredLayerError::MaxMetricsReached);
        let clock = Clock::get()?;
        reputation.last_updated = clock.unix_timestamp;
        Ok(())
    }
}

// Add Risk Flag
#[derive(Accounts)]
pub struct AddRiskFlag<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, reputation.wallet.as_ref()],
        bump = reputation.bump,
        has_one = authority @ CredLayerError::Unauthorized
    )]
    pub reputation: Account<'info, ReputationAccount>,
    pub authority: Signer<'info>,
}

pub mod add_risk_flag {
    use super::*;
    pub fn handler(ctx: Context<AddRiskFlag>, flag: RiskFlag) -> Result<()> {
        let reputation = &mut ctx.accounts.reputation;
        for existing_flag in reputation.risk_flags.iter() {
            if *existing_flag == flag && flag != RiskFlag::None {
                return Ok(());
            }
        }
        let mut found = false;
        for slot in reputation.risk_flags.iter_mut() {
            if *slot == RiskFlag::None {
                *slot = flag;
                found = true;
                reputation.active_flags_count = reputation.active_flags_count.checked_add(1).ok_or(CredLayerError::ArithmeticOverflow)?;
                break;
            }
        }
        require!(found, CredLayerError::MaxRiskFlagsReached);
        let clock = Clock::get()?;
        reputation.last_updated = clock.unix_timestamp;
        Ok(())
    }
}

// Remove Risk Flag
#[derive(Accounts)]
pub struct RemoveRiskFlag<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, reputation.wallet.as_ref()],
        bump = reputation.bump,
        has_one = authority @ CredLayerError::Unauthorized
    )]
    pub reputation: Account<'info, ReputationAccount>,
    pub authority: Signer<'info>,
}

pub mod remove_risk_flag {
    use super::*;
    pub fn handler(ctx: Context<RemoveRiskFlag>, flag: RiskFlag) -> Result<()> {
        let reputation = &mut ctx.accounts.reputation;
        let mut found = false;
        for slot in reputation.risk_flags.iter_mut() {
            if *slot == flag && flag != RiskFlag::None {
                *slot = RiskFlag::None;
                found = true;
                reputation.active_flags_count = reputation.active_flags_count.checked_sub(1).ok_or(CredLayerError::ArithmeticOverflow)?;
                break;
            }
        }
        require!(found, CredLayerError::RiskFlagNotFound);
        let clock = Clock::get()?;
        reputation.last_updated = clock.unix_timestamp;
        Ok(())
    }
}

// Close Reputation
#[derive(Accounts)]
pub struct CloseReputation<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, reputation.wallet.as_ref()],
        bump = reputation.bump,
        has_one = authority @ CredLayerError::Unauthorized,
        close = authority
    )]
    pub reputation: Account<'info, ReputationAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub mod close_reputation {
    use super::*;
    pub fn handler(_ctx: Context<CloseReputation>) -> Result<()> {
        Ok(())
    }
}
```

### 4. Build the Program

1. Click the **"Build"** button (hammer icon) in the left sidebar
2. Wait for compilation (takes 1-2 minutes)
3. You should see: **"Build successful"**

### 5. Connect Your Wallet

1. Click **"Connect Wallet"** in the top right
2. Select your wallet (Phantom, Solflare, etc.)
3. Approve the connection
4. Make sure you're on **Devnet**

### 6. Get Devnet SOL

If you don't have devnet SOL:
1. Go to https://faucet.solana.com/
2. Enter your wallet address: `8MCrTbs3CkHGgJSi6JARdPnEcQ5xs9N4LH4uEdehALfa`
3. Request airdrop

### 7. Deploy the Program

1. Click the **"Deploy"** button
2. Select **"Devnet"**
3. Confirm the transaction in your wallet
4. Wait for deployment (30-60 seconds)

### 8. Copy the Program ID

After deployment, you'll see:
```
Program Id: <YOUR_NEW_PROGRAM_ID>
```

**Copy this Program ID!** You'll need it for the frontend.

### 9. Update Frontend Configuration

Back in your local project, update `.env`:

```env
VITE_PROGRAM_ID=<YOUR_NEW_PROGRAM_ID>
VITE_SOLANA_NETWORK=devnet
```

### 10. Test the Deployment

In Solana Playground, you can test the program:

1. Click the **"Test"** tab
2. Run the test file
3. Verify all tests pass

---

## ✅ Success!

Your CredLayer contract is now deployed on Solana Devnet!

**Next Steps:**
1. Update frontend `.env` with new Program ID
2. Build and deploy frontend to Vercel
3. Test the full application

---

## 📝 Quick Reference

**Solana Playground:** https://beta.solpg.io/
**Your Wallet:** `8MCrTbs3CkHGgJSi6JARdPnEcQ5xs9N4LH4uEdehALfa`
**Network:** Devnet
**Faucet:** https://faucet.solana.com/

---

## Need Help?

If you encounter any issues:
1. Check the build logs in Solana Playground
2. Verify you're on Devnet
3. Ensure you have enough SOL for deployment (~2 SOL)
4. Try refreshing the page and reconnecting wallet

**Let me know the Program ID once deployed, and I'll help you update the frontend!**
