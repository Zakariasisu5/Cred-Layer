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

    /// Initialize a new reputation account for a wallet
    pub fn initialize_reputation(
        ctx: Context<InitializeReputation>,
        initial_score: u16,
    ) -> Result<()> {
        instructions::initialize_reputation::handler(ctx, initial_score)
    }

    /// Update the reputation score for a wallet
    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        new_score: u16,
        risk_level: RiskLevel,
        confidence: u16,
    ) -> Result<()> {
        instructions::update_reputation::handler(ctx, new_score, risk_level, confidence)
    }

    /// Add a behavioral metric to the reputation account
    pub fn add_metric(
        ctx: Context<AddMetric>,
        metric_type: MetricType,
        value: u16,
    ) -> Result<()> {
        instructions::add_metric::handler(ctx, metric_type, value)
    }

    /// Add a risk flag to the reputation account
    pub fn add_risk_flag(
        ctx: Context<AddRiskFlag>,
        flag: RiskFlag,
    ) -> Result<()> {
        instructions::add_risk_flag::handler(ctx, flag)
    }

    /// Remove a risk flag from the reputation account
    pub fn remove_risk_flag(
        ctx: Context<RemoveRiskFlag>,
        flag: RiskFlag,
    ) -> Result<()> {
        instructions::remove_risk_flag::handler(ctx, flag)
    }

    /// Close a reputation account and reclaim rent
    pub fn close_reputation(
        ctx: Context<CloseReputation>,
    ) -> Result<()> {
        instructions::close_reputation::handler(ctx)
    }
}
