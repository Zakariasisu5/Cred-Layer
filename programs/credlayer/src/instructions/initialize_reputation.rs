use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

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
    
    /// The wallet this reputation is for
    /// CHECK: This is the wallet we're creating reputation for
    pub wallet: AccountInfo<'info>,
    
    /// Authority that can update this reputation
    pub authority: Signer<'info>,
    
    /// Payer for the account creation
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeReputation>,
    initial_score: u16,
) -> Result<()> {
    // Validate initial score
    require!(
        initial_score <= MAX_TRUST_SCORE,
        CredLayerError::InvalidTrustScore
    );
    
    let reputation = &mut ctx.accounts.reputation;
    let clock = Clock::get()?;
    
    // Initialize reputation account
    reputation.version = REPUTATION_VERSION;
    reputation.wallet = ctx.accounts.wallet.key();
    reputation.authority = ctx.accounts.authority.key();
    reputation.trust_score = initial_score;
    reputation.risk_level = classify_risk_level(initial_score);
    reputation.confidence = 5000; // 50% initial confidence
    reputation.last_updated = clock.unix_timestamp;
    reputation.created_at = clock.unix_timestamp;
    reputation.update_count = 0;
    reputation.metrics = [Metric::default(); MAX_METRICS];
    reputation.risk_flags = [RiskFlag::None; MAX_RISK_FLAGS];
    reputation.active_flags_count = 0;
    reputation.bump = ctx.bumps.reputation;
    
    msg!("Reputation initialized for wallet: {}", reputation.wallet);
    msg!("Initial trust score: {}", reputation.trust_score);
    
    Ok(())
}

/// Classify risk level based on trust score
fn classify_risk_level(score: u16) -> RiskLevel {
    match score {
        81..=100 => RiskLevel::HighlyTrusted,
        61..=80 => RiskLevel::Trusted,
        31..=60 => RiskLevel::MediumRisk,
        _ => RiskLevel::HighRisk,
    }
}
