import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/reputation/history/:wallet
// Placeholder — Waiting real data
router.get('/:wallet', async (req: Request, res: Response) => {
  const { wallet } = req.params;

  return res.json({
    wallet,
    history: [],
    message: 'History will be available after Supabase integration',
  });
});

export default router;