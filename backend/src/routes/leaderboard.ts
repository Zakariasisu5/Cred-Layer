import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/leaderboard
// Placeholder — Waiting real data
router.get('/', async (req: Request, res: Response) => {
  return res.json({
    leaderboard: [
      // Fake data
      { rank: 1, wallet: 'Coming soon...', score: null, riskLabel: null },
    ],
    message: 'Leaderboard will be populated after Supabase integration',
  });
});

export default router;