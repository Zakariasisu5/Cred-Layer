use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct AddRiskFlag<'info> {
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
    ctx: Context<AddRiskFlag>,
    flag: RiskFlag,
) -> Result<()> {
    let reputation = &mut ctx.accounts.reputation;
    
    // Check if flag already exists
    for existing_flag in reputation.risk_flags.iter() {
        if *existing_flag == flag && flag != RiskFlag::None {
            // Flag already exists, no need to add again
            return Ok(());
        }
    }
    
    // Find an empty slot
    let mut found = false;
    for slot in reputation.risk_flags.iter_mut() {
        if *slot == RiskFlag::None {
            *slot = flag;
            found = true;
            reputation.active_flags_count = reputation.active_flags_count
                .checked_add(1)
                .ok_or(CredLayerError::ArithmeticOverflow)?;
            break;
        }
    }
    
    require!(found, CredLayerError::MaxRiskFlagsReached);
    
    // Update timestamp
    let clock = Clock::get()?;
    reputation.last_updated = clock.unix_timestamp;
    
    msg!("Risk flag added: {:?}", flag);
    msg!("Active flags count: {}", reputation.active_flags_count);
    
    Ok(())
}
