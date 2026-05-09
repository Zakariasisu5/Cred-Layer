import { Router, Request, Response } from 'express';
import { fetchWalletSignals } from '../blockchain/solanaFetcher';

const router = Router();

// GET /api/analytics/:wallet
router.get('/:wallet', async (req: Request, res: Response) => {
  const walletParam = req.params.wallet;
  const wallet = Array.isArray(walletParam) ? walletParam[0] : walletParam;;

  try {
    const signals = await fetchWalletSignals(wallet);

    return res.json({
      wallet,
      analytics: {
        totalVolumeSOL: signals.totalVolumeSOL,
        transactionCount: signals.transactionCount,
        uniqueCounterparties: signals.uniqueCounterparties,
        defiInteractions: signals.defiInteractions,
        walletAgeMonths: signals.walletAgeMonths,
        firstTransactionDate: signals.firstTransactionDate,
        lastTransactionDate: signals.lastTransactionDate,
        activityScore: signals.transactionCount > 100 ? 'high' : signals.transactionCount > 20 ? 'medium' : 'low',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;