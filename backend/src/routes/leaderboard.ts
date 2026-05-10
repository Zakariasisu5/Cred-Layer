import { Router, Request, Response } from 'express';
import { getLeaderboard } from '../services/reputationStorage';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const leaderboard = await getLeaderboard();

    return res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        wallet: entry.wallet_address,
        score: entry.score,
        riskLabel: entry.risk_label,
        lastUpdated: entry.updated_at,
      })),
      total: leaderboard.length,
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;