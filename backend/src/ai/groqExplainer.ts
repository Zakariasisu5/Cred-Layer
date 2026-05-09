import Groq from 'groq-sdk';
import { WalletSignals } from '../blockchain/solanaFetcher';
import { ScoreResult } from '../services/scoringService';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateExplanation(
  signals: WalletSignals,
  scoreResult: ScoreResult
): Promise<string> {
  const prompt = `You are CredLayer, a decentralized reputation system for Solana wallets.

Analyze this wallet and write a clear, professional trust report in 3-4 sentences.
Be specific with the numbers. End with a recommendation.

WALLET DATA:
- Address: ${signals.walletAddress}
- Age: ${signals.walletAgeMonths} month(s)
- Total transactions: ${signals.transactionCount}
- DeFi interactions with known protocols: ${signals.defiInteractions}
- Unique counterparties: ${signals.uniqueCounterparties}
- Total volume: ${signals.totalVolumeSOL} SOL
- Suspicious activity detected: ${signals.suspiciousActivity}
- Suspicious signals: ${signals.suspiciousReasons.length > 0 ? signals.suspiciousReasons.join(', ') : 'None'}
- First transaction: ${signals.firstTransactionDate}
- Last transaction: ${signals.lastTransactionDate}

SCORE: ${scoreResult.score}/100 — ${scoreResult.riskLabel}
Breakdown: Wallet Age ${scoreResult.breakdown.walletAge}/20 | Activity ${scoreResult.breakdown.activity}/20 | DeFi ${scoreResult.breakdown.defi}/20 | Behavior ${scoreResult.breakdown.behavior}/20 | Network ${scoreResult.breakdown.network}/20

Write the trust report now:`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() ?? 'Unable to generate explanation.';
}