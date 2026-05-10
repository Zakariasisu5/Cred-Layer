import { Router, Request, Response } from "express";
import { fetchWalletSignals } from "../blockchain/solanaFetcher";
import { calculateScore } from "../services/scoringService";
import { generateExplanation } from "../ai/claudeExplainer";
import { upsertReputation } from "../services/reputationStorage";

const router = Router();

// GET /api/premium/reputation/:wallet
// Paid endpoint via x402 — AI agents and third-party applications
router.get("/reputation/:wallet", async (req: Request, res: Response) => {
  let wallet = req.params.wallet;

  // Ensure wallet is a string (not array)
  if (Array.isArray(wallet)) {
    wallet = wallet[0];
  }

  if (!wallet || wallet.length < 32 || wallet.length > 44) {
    return res.status(400).json({ error: "Invalid Solana wallet address" });
  }

  try {
    const signals = await fetchWalletSignals(wallet);
    const scoreResult = calculateScore(signals);
    const explanation = await generateExplanation(signals, scoreResult);

    await upsertReputation(wallet, scoreResult, signals, explanation);

    // Enriched response for premium clients
    return res.json({
      wallet,
      score: scoreResult.score,
      risk: scoreResult.risk,
      riskLabel: scoreResult.riskLabel,
      breakdown: scoreResult.breakdown,
      explanation,
      signals,
      premium: true,
      paidAt: new Date().toISOString(),
      // Metadata for AI agents
      recommendation:
        scoreResult.score >= 61
          ? "SAFE_TO_TRANSACT"
          : scoreResult.score >= 31
            ? "PROCEED_WITH_CAUTION"
            : "DO_NOT_TRANSACT",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
