use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct RemoveRiskFlag<'info> {
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
    ctx: Context<RemoveRiskFlag>,
    flag: RiskFlag,
) -> Result<()> {
    let reputation = &mut ctx.accounts.reputation;
    
    // Find and remove the flag
    let mut found = false;
    for slot in reputation.risk_flags.iter_mut() {
        if *slot == flag && flag != RiskFlag::None {
            *slot = RiskFlag::None;
            found = true;
            reputation.active_flags_count = reputation.active_flags_count
                .checked_sub(1)
                .ok_or(CredLayerError::ArithmeticOverflow)?;
            break;
        }
    }
    
    require!(found, CredLayerError::RiskFlagNotFound);
    
    // Update timestamp
    let clock = Clock::get()?;
    reputation.last_updated = clock.unix_timestamp;
    
    msg!("Risk flag removed: {:?}", flag);
    msg!("Active flags count: {}", reputation.active_flags_count);
    
    Ok(())
}
