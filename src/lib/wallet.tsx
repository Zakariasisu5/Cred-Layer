import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

type WalletName = "Phantom" | "Solflare" | "Backpack";

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  walletName: WalletName | null;
  connect: (name: WalletName) => Promise<void>;
  disconnect: () => Promise<void>;
}

const Ctx = createContext<WalletState | null>(null);

const STORAGE_KEY = "credlayer:wallet";

function fakeAddress(seed: string) {
  // Deterministic, base58-ish mock address
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let out = "";
  for (let i = 0; i < 44; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out += chars[h % chars.length];
  }
  return out;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<WalletName | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const s = JSON.parse(raw);
        setAddress(s.address);
        setWalletName(s.walletName);
        setConnected(true);
      }
    } catch {}
  }, []);

  const connect = useCallback(
    async (name: WalletName) => {
      if (connecting) return;
      if (connected) {
        toast.info("Wallet already connected");
        return;
      }
      setConnecting(true);
      try {
        // Simulated wallet handshake (Phantom/Solflare/Backpack)
        await new Promise((r) => setTimeout(r, 700));
        const addr = fakeAddress(name + Date.now());
        setAddress(addr);
        setWalletName(name);
        setConnected(true);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: addr, walletName: name }));
        } catch {}
        toast.success(`${name} connected`, {
          description: addr.slice(0, 6) + "…" + addr.slice(-4),
        });
      } catch (e: any) {
        toast.error("Failed to connect", { description: e?.message ?? "Unknown error" });
      } finally {
        setConnecting(false);
      }
    },
    [connecting, connected],
  );

  const disconnect = useCallback(async () => {
    setConnected(false);
    setAddress(null);
    setWalletName(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    toast.success("Wallet disconnected");
  }, []);

  return (
    <Ctx.Provider value={{ connected, connecting, address, walletName, connect, disconnect }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWallet must be used within WalletProvider");
  return v;
}

export function shortAddress(a: string | null) {
  if (!a) return "";
  return a.slice(0, 4) + "…" + a.slice(-4);
}

// Solana base58 check (32–44 chars, no 0OIl)
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export function isValidSolanaAddress(addr: string) {
  return BASE58.test(addr.trim());
}
