// Wallet utility functions — separated to satisfy Fast Refresh rules.

export function shortAddress(a: string | null): string {
  if (!a) return "";
  return a.slice(0, 4) + "…" + a.slice(-4);
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export function isValidSolanaAddress(addr: string): boolean {
  return BASE58.test(addr.trim());
}
