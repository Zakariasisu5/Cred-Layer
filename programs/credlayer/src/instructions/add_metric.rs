use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct AddMetric<'info> {
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
    ctx: Context<AddMetric>,
    metric_type: MetricType,
    value: u16,
) -> Result<()> {
    // Validate metric value
    require!(
        value <= 100,
        CredLayerError::InvalidMetricValue
    );
    
    let reputation = &mut ctx.accounts.reputation;
    
    // Find the metric slot or an empty slot
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
    
    // Update timestamp
    let clock = Clock::get()?;
    reputation.last_updated = clock.unix_timestamp;
    
    msg!("Metric added: {:?} = {}", metric_type, value);
    
    Ok(())
}
