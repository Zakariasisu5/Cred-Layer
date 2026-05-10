/**
 * Claude AI Explainer — Generates human-readable explanations for wallet trust scores
 */

import type { WalletSignals } from "../blockchain/solanaFetcher";
import type { ScoreResult } from "../services/scoringService";

/**
 * Generates a human-readable explanation for a wallet's trust score.
 * @param signals - Wallet risk signals from blockchain analysis
 * @param scoreResult - Calculated reputation score and risk assessment
 * @returns Human-readable explanation of the wallet's risk profile
 */
export async function generateExplanation(
  signals: WalletSignals,
  scoreResult: ScoreResult,
): Promise<string> {
  // TODO: Integrate with Claude AI API for dynamic explanations
  // For now, return a template-based explanation

  const riskDescription =
    scoreResult.score >= 61
      ? "This wallet exhibits low risk behavior and appears trustworthy."
      : scoreResult.score >= 31
        ? "This wallet shows moderate risk. Proceed with standard security practices."
        : "This wallet exhibits high risk. Exercise caution with transactions.";

  const breakdownItems = Object.entries(scoreResult.breakdown)
    .map(([key, value]) => `- ${key}: ${value.toFixed(2)}%`)
    .join("\n");

  return `Risk Assessment: ${riskDescription}\n\nScore Breakdown:\n${breakdownItems}`;
}
