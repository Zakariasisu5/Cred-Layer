import { PublicKey } from "@solana/web3.js";

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaWalletAddress(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const wallet = value.trim();
  if (!BASE58_REGEX.test(wallet)) return false;

  try {
    const pubkey = new PublicKey(wallet);
    return pubkey.toBase58() === wallet;
  } catch {
    return false;
  }
}
