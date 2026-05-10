use anchor_lang::prelude::*;
use crate::constants::*;

/// Reputation account storing trust score and behavioral data for a wallet
#[account]
pub struct ReputationAccount {
    /// Version of the account structure
    pub version: u8,
    
    /// The wallet address this reputation belongs to
    pub wallet: Pubkey,
    
    /// Authority that can update this reputation (typically the CredLayer program authority)
    pub authority: Pubkey,
    
    /// Trust score (0-100)
    pub trust_score: u16,
    
    /// Risk level classification
    pub risk_level: RiskLevel,
    
    /// Confidence in the score (0-10000, representing 0.00% to 100.00%)
    pub confidence: u16,
    
    /// Timestamp of last update
    pub last_updated: i64,
    
    /// Timestamp of account creation
    pub created_at: i64,
    
    /// Number of times the reputation has been updated
    pub update_count: u64,
    
    /// Behavioral metrics
    pub metrics: [Metric; MAX_METRICS],
    
    /// Risk flags
    pub risk_flags: [RiskFlag; MAX_RISK_FLAGS],
    
    /// Number of active risk flags
    pub active_flags_count: u8,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl ReputationAccount {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        32 + // wallet
        32 + // authority
        2 + // trust_score
        1 + // risk_level
        2 + // confidence
        8 + // last_updated
        8 + // created_at
        8 + // update_count
        (Metric::LEN * MAX_METRICS) + // metrics
        (RiskFlag::LEN * MAX_RISK_FLAGS) + // risk_flags
        1 + // active_flags_count
        1; // bump
}

/// Risk level classification
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum RiskLevel {
    HighlyTrusted,  // 81-100
    Trusted,        // 61-80
    MediumRisk,     // 31-60
    HighRisk,       // 0-30
}

impl Default for RiskLevel {
    fn default() -> Self {
        RiskLevel::MediumRisk
    }
}

/// Behavioral metric
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct Metric {
    pub metric_type: MetricType,
    pub value: u16, // 0-100
}

impl Metric {
    pub const LEN: usize = 1 + 2; // metric_type + value
}

/// Types of behavioral metrics
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
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

/// Risk flags for suspicious activity
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
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
