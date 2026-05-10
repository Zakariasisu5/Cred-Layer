// src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface WalletReputation {
  wallet: string;
  score: number;
  risk: "high" | "medium" | "trusted" | "highly_trusted";
  riskLabel: string;
  explanation: string;
  breakdown: {
    walletAge: number;
    activity: number;
    defi: number;
    behavior: number;
    network: number;
  };
  signals: {
    walletAddress: string;
    walletAgeMonths: number;
    transactionCount: number;
    defiInteractions: number;
    suspiciousActivity: boolean;
    suspiciousReasons: string[];
    totalVolumeSOL: number;
    uniqueCounterparties: number;
    firstTransactionDate: string | null;
    lastTransactionDate: string | null;
  };
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  score: number;
  riskLabel: string;
  lastUpdated: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
}

// Analyse un wallet — GET /api/reputation/:wallet
export async function fetchReputation(wallet: string): Promise<WalletReputation> {
  const res = await fetch(`${API_BASE}/api/reputation/${wallet}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch reputation`);
  }
  return res.json();
}

// Leaderboard — GET /api/leaderboard
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch(`${API_BASE}/api/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export interface AnalyticsResponse {
  wallet: string;
  totalTransactions: number;
  totalVolumeSOL: number;
  defiInteractions: number;
  uniqueCounterparties: number;
  walletAgeMonths: number;
  riskScore: number;
  riskLabel: string;
}

// Analytics — GET /api/analytics/:wallet
export async function fetchAnalytics(wallet: string): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE}/api/analytics/${wallet}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
