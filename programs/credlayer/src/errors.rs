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
