import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// Connecting to the Solana network (devnet for testing, mainnet-beta for production)
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Types 
export interface WalletSignals {
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
}

// Known DeFi Protocols on Solana 
// Detects if the wallet has interacted with legitimate protocols
const KNOWN_DEFI_PROGRAMS = new Set([
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP', // Orca
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium
  'So11111111111111111111111111111111111111112',    // Wrapped SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
]);

// Main function to fetch wallet signals 

export async function fetchWalletSignals(walletAddress: string): Promise<WalletSignals> {
  // 1. Validate the Solana wallet address
  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(walletAddress);
  } catch {
    throw new Error(`Invalid Solana wallet address: ${walletAddress}`);
  }

  // 2. Fetch transaction signatures (max 50 for MVP)
  const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 50 });

  if (signatures.length === 0) {
    return buildEmptySignals(walletAddress);
  }

  // 3. Calculate wallet age from the first transaction
  const oldestTx = signatures[signatures.length - 1];
  const newestTx = signatures[0];

  const firstDate = oldestTx.blockTime ? new Date(oldestTx.blockTime * 1000) : null;
  const lastDate = newestTx.blockTime ? new Date(newestTx.blockTime * 1000) : null;

  const walletAgeMonths = firstDate
    ? Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  // 4. Fetch transaction details for analysis
  const txDetails = await fetchTransactionDetails(signatures.slice(0, 20));

  // 5. Analyze the signals from transactions
  const { defiInteractions, totalVolumeSOL, uniqueCounterparties } =
    analyzeTransactions(txDetails, walletAddress);

  // 6. Detect suspicious behavior based on patterns in transactions
  const { suspiciousActivity, suspiciousReasons } =
    detectSuspiciousBehavior(signatures, txDetails, walletAgeMonths);

  return {
    walletAddress,
    walletAgeMonths,
    transactionCount: signatures.length,
    defiInteractions,
    suspiciousActivity,
    suspiciousReasons,
    totalVolumeSOL,
    uniqueCounterparties,
    firstTransactionDate: firstDate ? firstDate.toISOString() : null,
    lastTransactionDate: lastDate ? lastDate.toISOString() : null,
  };
}

// Retrieves transaction details in batches to avoid rate limits and improve performance

async function fetchTransactionDetails(
  signatures: Awaited<ReturnType<Connection['getSignaturesForAddress']>>
): Promise<ParsedTransactionWithMeta[]> {
  const txPromises = signatures.map((sig) =>
    connection.getParsedTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
    })
  );

  const results = await Promise.allSettled(txPromises);

  return results
    .filter((r): r is PromiseFulfilledResult<ParsedTransactionWithMeta> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value);
}

// Analyze transactions to extract signals such as DeFi interactions, total volume, and unique counterparties

function analyzeTransactions(
  txDetails: ParsedTransactionWithMeta[],
  walletAddress: string
): { defiInteractions: number; totalVolumeSOL: number; uniqueCounterparties: number } {
  let defiInteractions = 0;
  let totalVolumeSOL = 0;
  const uniqueCounterparties = new Set<string>();

  for (const tx of txDetails) {
    if (!tx?.meta || !tx.transaction) continue;

    const accountKeys = tx.transaction.message.accountKeys.map((k) =>
      k.pubkey.toString()
    );

    // Detects DeFi interactions
    for (const key of accountKeys) {
      if (KNOWN_DEFI_PROGRAMS.has(key)) {
        defiInteractions++;
        break;
      }
      // Collect unique counterparties (wallets interacted with, excluding the wallet itself)
      if (key !== walletAddress) {
        uniqueCounterparties.add(key);
      }
    }

    // Calculate total volume in SOL
    if (tx.meta.preBalances && tx.meta.postBalances) {
      const walletIndex = accountKeys.indexOf(walletAddress);
      if (walletIndex !== -1) {
        const balanceDiff = Math.abs(
          (tx.meta.preBalances[walletIndex] - tx.meta.postBalances[walletIndex]) /
            LAMPORTS_PER_SOL
        );
        totalVolumeSOL += balanceDiff;
      }
    }
  }

  return {
    defiInteractions,
    totalVolumeSOL: Math.round(totalVolumeSOL * 100) / 100,
    uniqueCounterparties: uniqueCounterparties.size,
  };
}

// Detect suspicious behavior based on patterns in transactions

function detectSuspiciousBehavior(
  signatures: Awaited<ReturnType<Connection['getSignaturesForAddress']>>,
  txDetails: ParsedTransactionWithMeta[],
  walletAgeMonths: number
): { suspiciousActivity: boolean; suspiciousReasons: string[] } {
  const reasons: string[] = [];

  // Signal 1 : New wallet with unusually high transaction volume (bot pattern)
  if (walletAgeMonths < 1 && signatures.length > 20) {
    reasons.push('New wallet with unusually high transaction volume');
  }

  // Signal 2 : High number of failed transactions (spam or attack pattern)
  const failedTxCount = signatures.filter((s) => s.err !== null).length;
  const failureRate = failedTxCount / signatures.length;
  if (failureRate > 0.3 && signatures.length > 5) {
    reasons.push(`High failure rate: ${Math.round(failureRate * 100)}% of transactions failed`);
  }

  // Signal 3 : Burst transactions (many in a very short timeframe  — could indicate bot activity)
  if (signatures.length >= 5) {
    const recentTimes = signatures
      .slice(0, 10)
      .map((s) => s.blockTime || 0)
      .filter((t) => t > 0);

    if (recentTimes.length >= 2) {
      const timeSpanSeconds = recentTimes[0] - recentTimes[recentTimes.length - 1];
      const txPerMinute = (recentTimes.length / timeSpanSeconds) * 60;
      if (txPerMinute > 10) {
        reasons.push(`Burst activity detected: ~${Math.round(txPerMinute)} tx/minute`);
      }
    }
  }

  // Signal 4 : Recent transaction errors
  const recentErrors = signatures.slice(0, 5).filter((s) => s.err !== null).length;
  if (recentErrors >= 3) {
    reasons.push('Multiple recent transaction errors');
  }

  return {
    suspiciousActivity: reasons.length > 0,
    suspiciousReasons: reasons,
  };
}

// Wallet without history

function buildEmptySignals(walletAddress: string): WalletSignals {
  return {
    walletAddress,
    walletAgeMonths: 0,
    transactionCount: 0,
    defiInteractions: 0,
    suspiciousActivity: false,
    suspiciousReasons: ['No transaction history found'],
    totalVolumeSOL: 0,
    uniqueCounterparties: 0,
    firstTransactionDate: null,
    lastTransactionDate: null,
  };
}