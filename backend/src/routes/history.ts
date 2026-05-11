import { Router, Request, Response } from "express";
import { getWalletHistory } from "../services/reputationStorage";
import { isValidSolanaWalletAddress } from "../lib/walletValidation";

const router = Router();

// GET /api/reputation/history/:wallet
router.get("/:wallet", async (req: Request, res: Response) => {
  const walletParam = req.params.wallet;
  const wallet = (Array.isArray(walletParam) ? walletParam[0] : walletParam)?.trim();

  if (!isValidSolanaWalletAddress(wallet)) {
    return res.status(400).json({ error: "Invalid Solana wallet address" });
  }

  try {
    const history = await getWalletHistory(wallet);
    return res.json({ wallet, history, count: history.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
