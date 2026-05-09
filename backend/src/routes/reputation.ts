import { Router, Request, Response } from 'express';
import { fetchWalletSignals } from '../blockchain/solanaFetcher';
import { calculateScore } from '../services/scoringService';
import { generateExplanation } from '../ai/groqExplainer';

const router = Router();

// Route: GET /reputation/:wallet
router.get('/:wallet', async (req: Request, res: Response) => {
  const walletParam = req.params.wallet;
  const wallet = Array.isArray(walletParam) ? walletParam[0] : walletParam;

  if (!wallet || wallet.length < 32 || wallet.length > 44) {
    return res.status(400).json({ error: 'Invalid Solana wallet address' });
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

  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to fetch wallet data',
      details: error.message,
    });
  }
});

export default router;