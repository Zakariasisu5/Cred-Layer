import { Router, Request, Response } from "express";
import { fetchWalletSignals } from "../blockchain/solanaFetcher";
import { calculateScore } from "../services/scoringService";
import { isValidSolanaWalletAddress } from "../lib/walletValidation";

const router = Router();

// GET /api/analytics/:wallet
router.get("/:wallet", async (req: Request, res: Response) => {
  const walletParam = req.params.wallet;
  const wallet = (Array.isArray(walletParam) ? walletParam[0] : walletParam)?.trim();

  if (!isValidSolanaWalletAddress(wallet)) {
    return res.status(400).json({ error: "Invalid Solana wallet address" });
  }

  try {
    const signals = await fetchWalletSignals(wallet);
    const scoreResult = calculateScore(signals);

    const activityScore =
      signals.transactionCount > 100 ? "high" : signals.transactionCount > 20 ? "medium" : "low";

    return res.json({
      wallet,
      totalTransactions: signals.transactionCount,
      totalVolumeSOL: signals.totalVolumeSOL,
      defiInteractions: signals.defiInteractions,
      uniqueCounterparties: signals.uniqueCounterparties,
      walletAgeMonths: signals.walletAgeMonths,
      riskScore: scoreResult.score,
      riskLabel: scoreResult.riskLabel,
      analytics: {
        totalTransactions: signals.transactionCount,
        totalVolumeSOL: signals.totalVolumeSOL,
        transactionCount: signals.transactionCount,
        uniqueCounterparties: signals.uniqueCounterparties,
        defiInteractions: signals.defiInteractions,
        walletAgeMonths: signals.walletAgeMonths,
        riskScore: scoreResult.score,
        riskLabel: scoreResult.riskLabel,
        firstTransactionDate: signals.firstTransactionDate,
        lastTransactionDate: signals.lastTransactionDate,
        activityScore,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
