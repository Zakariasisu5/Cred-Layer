// Rule-based reputation engine for Solana wallets.
// MVP: deterministic feature engineering + weighted scoring + anomaly flags.
// In production, replace `mockWalletFeatures` with a real Solana RPC fetcher.

export type WalletFeatures = {
  walletAgeDays: number;
  txCount: number;
  txPerDay: number;
  successRate: number; // 0-1
  totalVolumeSol: number;
  uniqueProgramsCalled: number;
  defiProtocols: number;
  repaymentRate: number; // 0-1, lending repayment success
  uniqueCounterparties: number;
  failedTxRatio: number; // 0-1
  maxTxPerMinute: number; // burst signal
  newWalletInteractionRatio: number; // ratio of counterparties <7 days old
  unverifiedProgramCalls: number;
};

export type ReputationResult = {
  wallet: string;
  trust_score: number; // 0-100
  risk_level: "Highly Trusted" | "Trusted" | "Medium Risk" | "High Risk";
  confidence: number; // 0-1
  flags: string[];
  insights: string[];
  metrics: {
    label: string;
    value: number; // 0-100
  }[];
  features: WalletFeatures;
};

// Deterministic pseudo-random feature generator from wallet address.
// Replace with real Solana RPC analysis.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function rng(seed: number) {
  let s = seed * 1e9;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function mockWalletFeatures(wallet: string): WalletFeatures {
  const r = rng(hashSeed(wallet));
  const ageDays = Math.round(30 + r() * 1200);
  const txCount = Math.round(50 + r() * 3000);
  const txPerDay = +(txCount / Math.max(ageDays, 1)).toFixed(2);
  const successRate = +(0.85 + r() * 0.14).toFixed(3);
  return {
    walletAgeDays: ageDays,
    txCount,
    txPerDay,
    successRate,
    totalVolumeSol: Math.round(r() * 5000),
    uniqueProgramsCalled: Math.round(3 + r() * 30),
    defiProtocols: Math.round(1 + r() * 12),
    repaymentRate: +(0.7 + r() * 0.3).toFixed(3),
    uniqueCounterparties: Math.round(10 + r() * 400),
    failedTxRatio: +(1 - successRate).toFixed(3),
    maxTxPerMinute: Math.round(1 + r() * 25),
    newWalletInteractionRatio: +(r() * 0.5).toFixed(3),
    unverifiedProgramCalls: Math.round(r() * 8),
  };
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function scoreWallet(wallet: string, f: WalletFeatures): ReputationResult {
  // Sub-scores 0-100
  const ageScore = clamp((f.walletAgeDays / 730) * 100); // 2y maxes
  const activityScore = clamp(Math.log10(f.txCount + 1) * 33);
  const successScore = clamp(f.successRate * 100);
  const diversityScore = clamp((f.uniqueProgramsCalled / 20) * 100);
  const defiScore = clamp((f.defiProtocols / 8) * 100);
  const repaymentScore = clamp(f.repaymentRate * 100);
  const counterpartyScore = clamp(Math.log10(f.uniqueCounterparties + 1) * 40);

  // Risk penalties 0-100 (higher = worse)
  const burstPenalty = clamp((f.maxTxPerMinute / 25) * 100);
  const sybilPenalty = clamp(f.newWalletInteractionRatio * 200);
  const unverifiedPenalty = clamp(f.unverifiedProgramCalls * 12);
  const failPenalty = clamp(f.failedTxRatio * 200);

  const positive =
    ageScore * 0.18 +
    activityScore * 0.12 +
    successScore * 0.14 +
    diversityScore * 0.12 +
    defiScore * 0.1 +
    repaymentScore * 0.18 +
    counterpartyScore * 0.16;

  const risk =
    burstPenalty * 0.25 +
    sybilPenalty * 0.3 +
    unverifiedPenalty * 0.2 +
    failPenalty * 0.25;

  const trust = Math.round(clamp(positive - risk * 0.45));

  let risk_level: ReputationResult["risk_level"];
  if (trust >= 81) risk_level = "Highly Trusted";
  else if (trust >= 61) risk_level = "Trusted";
  else if (trust >= 31) risk_level = "Medium Risk";
  else risk_level = "High Risk";

  const flags: string[] = [];
  if (f.newWalletInteractionRatio > 0.3) flags.push("potential_sybil_cluster");
  if (f.maxTxPerMinute > 15) flags.push("abnormal_transaction_burst");
  if (f.unverifiedProgramCalls > 3) flags.push("unverified_program_interaction");
  if (f.defiProtocols < 2) flags.push("low_protocol_diversity");
  if (f.failedTxRatio > 0.1) flags.push("elevated_failure_rate");
  if (f.walletAgeDays < 60) flags.push("new_wallet");
  if (f.repaymentRate < 0.8) flags.push("weak_repayment_history");

  const insights: string[] = [];
  if (repaymentScore > 85) insights.push("Strong repayment history across lending protocols.");
  if (successScore > 95) insights.push("Consistent transaction success rate.");
  if (diversityScore > 70) insights.push("Healthy protocol diversity across the Solana ecosystem.");
  if (ageScore > 70) insights.push("Mature wallet with long-standing on-chain history.");
  if (flags.includes("potential_sybil_cluster")) insights.push("Counterparty graph overlaps with newly-created wallets — possible Sybil exposure.");
  if (flags.includes("abnormal_transaction_burst")) insights.push("Detected unusual transaction frequency spikes.");
  if (flags.includes("low_protocol_diversity")) insights.push("Limited DeFi protocol diversity — narrow behavioral surface.");
  if (insights.length === 0) insights.push("Behavior is within normal Solana retail-user distribution.");

  // Confidence: more activity & age => more reliable signal
  const confidence = +clamp(
    0.55 + (ageScore + activityScore + counterpartyScore) / 600,
    0,
    99
  ).toFixed(2);
  const confidenceNorm = Math.min(0.99, +(confidence / 1).toFixed(2));

  return {
    wallet,
    trust_score: trust,
    risk_level,
    confidence: confidenceNorm,
    flags,
    insights,
    metrics: [
      { label: "Behavioral Stability", value: Math.round(successScore) },
      { label: "Transaction Diversity", value: Math.round(diversityScore) },
      { label: "Counterparty Quality", value: Math.round(counterpartyScore) },
      { label: "Smart Contract Hygiene", value: Math.round(100 - unverifiedPenalty) },
      { label: "Sybil Resistance", value: Math.round(100 - sybilPenalty) },
      { label: "Repayment Reliability", value: Math.round(repaymentScore) },
    ],
    features: f,
  };
}

export function analyzeWallet(wallet: string): ReputationResult {
  return scoreWallet(wallet, mockWalletFeatures(wallet));
}
