use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, reputation.wallet.as_ref()],
        bump = reputation.bump,
        has_one = authority @ CredLayerError::Unauthorized
    )]
    pub reputation: Account<'info, ReputationAccount>,
    
    /// Authority that can update this reputation
    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateReputation>,
    new_score: u16,
    risk_level: RiskLevel,
    confidence: u16,
) -> Result<()> {
    // Validate inputs
    require!(
        new_score <= MAX_TRUST_SCORE,
        CredLayerError::InvalidTrustScore
    );
    
    require!(
        confidence <= MAX_CONFIDENCE,
        CredLayerError::InvalidConfidence
    );
    
    let reputation = &mut ctx.accounts.reputation;
    let clock = Clock::get()?;
    
    // Update reputation data
    reputation.trust_score = new_score;
    reputation.risk_level = risk_level;
    reputation.confidence = confidence;
    reputation.last_updated = clock.unix_timestamp;
    
    // Increment update counter
    reputation.update_count = reputation.update_count
        .checked_add(1)
        .ok_or(CredLayerError::ArithmeticOverflow)?;
    
    msg!("Reputation updated for wallet: {}", reputation.wallet);
    msg!("New trust score: {}", reputation.trust_score);
    msg!("Risk level: {:?}", reputation.risk_level);
    msg!("Confidence: {}", reputation.confidence);
    
    Ok(())
}
