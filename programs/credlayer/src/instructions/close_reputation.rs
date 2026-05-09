use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

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
    
    /// Authority that can close this reputation (receives rent refund)
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<CloseReputation>,
) -> Result<()> {
    msg!("Reputation account closed for wallet: {}", ctx.accounts.reputation.wallet);
    msg!("Rent refunded to authority: {}", ctx.accounts.authority.key());
    
    Ok(())
}
