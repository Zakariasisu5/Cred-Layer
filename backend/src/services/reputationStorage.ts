import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { WalletSignals } from "../blockchain/solanaFetcher";
import { ScoreResult } from "./scoringService";
export interface StoredReputation {
  id: string;
  wallet_address: string;
  score: number;
  risk: string;
  risk_label: string;
  explanation: string | null;
  signals: WalletSignals;
  breakdown: ScoreResult["breakdown"];
  created_at: string;
  updated_at: string;
}

// Saves or updates a wallet's reputation
export async function upsertReputation(
  wallet: string,
  scoreResult: ScoreResult,
  signals: WalletSignals,
  explanation: string | null,
): Promise<StoredReputation> {
  if (!isSupabaseConfigured()) {
    const now = new Date().toISOString();
    return {
      id: `local-${wallet}-${Date.now()}`,
      wallet_address: wallet,
      score: scoreResult.score,
      risk: scoreResult.risk,
      risk_label: scoreResult.riskLabel,
      explanation,
      signals,
      breakdown: scoreResult.breakdown,
      created_at: now,
      updated_at: now,
    };
  }

  const { data, error } = await getSupabase()
    .from("wallet_scores")
    .upsert(
      {
        wallet_address: wallet,
        score: scoreResult.score,
        risk: scoreResult.risk,
        risk_label: scoreResult.riskLabel,
        explanation,
        signals,
        breakdown: scoreResult.breakdown,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" },
    )
    .select()
    .single();

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

// Retrieve a wallet's transaction history
export async function getWalletHistory(wallet: string): Promise<StoredReputation[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from("wallet_scores")
    .select("*")
    .eq("wallet_address", wallet)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data || [];
}

// Retrieve the leaderboard — top 10 wallets by score
export async function getLeaderboard(): Promise<StoredReputation[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from("wallet_scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data || [];
}
