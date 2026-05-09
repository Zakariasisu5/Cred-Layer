use anchor_lang::prelude::*;

/// Seed for reputation PDA
pub const REPUTATION_SEED: &[u8] = b"reputation";

/// Maximum number of risk flags per account
pub const MAX_RISK_FLAGS: usize = 10;

/// Maximum number of metrics per account
pub const MAX_METRICS: usize = 6;

/// Minimum trust score
pub const MIN_TRUST_SCORE: u16 = 0;

/// Maximum trust score
pub const MAX_TRUST_SCORE: u16 = 100;

/// Maximum confidence value (represented as percentage * 100)
pub const MAX_CONFIDENCE: u16 = 10000; // 100.00%

/// Version of the reputation account structure
pub const REPUTATION_VERSION: u8 = 1;
