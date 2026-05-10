import { Router, Request, Response } from "express";
import { fetchWalletSignals } from "../blockchain/solanaFetcher";
import { calculateScore } from "../services/scoringService";
import { generateExplanation } from "../ai/groqExplainer";
import { upsertReputation, getWalletHistory } from "../services/reputationStorage";

const router = Router();

// Route: GET /reputation/:wallet
router.get("/:wallet", async (req: Request, res: Response) => {
  const walletParam = req.params.wallet;
  const wallet = Array.isArray(walletParam) ? walletParam[0] : walletParam;

  if (!wallet || wallet.length < 32 || wallet.length > 44) {
    return res.status(400).json({ error: "Invalid Solana wallet address" });
  }

  try {
    const signals = await fetchWalletSignals(wallet);
    const scoreResult = calculateScore(signals);
    const explanation = await generateExplanation(signals, scoreResult);

    return res.json({
      wallet,
      score: scoreResult.score,
      risk: scoreResult.risk,
      riskLabel: scoreResult.riskLabel,
      breakdown: scoreResult.breakdown,
      explanation,
      signals,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to fetch wallet data",
      details: message,
    });
  }
});

// POST /api/reputation/update — recalcul forcé
router.post("/update", async (req: Request, res: Response) => {
  const { wallet } = req.body;

  if (!wallet) {
    return res.status(400).json({ error: "wallet address required in body" });
  }

  try {
    const signals = await fetchWalletSignals(wallet);
    const scoreResult = calculateScore(signals);
    const explanation = await generateExplanation(signals, scoreResult);
    const stored = await upsertReputation(wallet, scoreResult, signals, explanation);

    return res.json({
      message: "Reputation recalculated successfully",
      wallet,
      score: scoreResult.score,
      risk: scoreResult.risk,
      riskLabel: scoreResult.riskLabel,
      explanation,
      updatedAt: stored.updated_at,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// GET /api/reputation/history/:wallet
router.get("/history/:wallet", async (req: Request, res: Response) => {
  const walletParam = req.params.wallet;
  const wallet = Array.isArray(walletParam) ? walletParam[0] : walletParam;

  try {
    const history = await getWalletHistory(wallet);
    return res.json({ wallet, history, count: history.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
