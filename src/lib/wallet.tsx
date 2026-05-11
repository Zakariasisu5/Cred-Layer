/* eslint-disable react-refresh/only-export-components */
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

// Real Solana addresses used for the demo
const DEMO_ADDRESSES: Record<WalletName, string> = {
  Phantom: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  Solflare: "GsbwXfJraMomNxBcjYLcG3mxkBUiyWXAB32fGbSMQRdW",
  Backpack: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKH",
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<WalletName | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setAddress(s.address);
        setWalletName(s.walletName);
        setConnected(true);
      }
    } catch (_e) {
      // Ignore malformed persisted state — start fresh
    }
  }, []);

  const connect = useCallback(
    async (name: WalletName) => {
      if (connecting || connected) return;
      setConnecting(true);
      try {
        await new Promise((r) => setTimeout(r, 700));

        // Use a real Solana address for the demo
        const addr = DEMO_ADDRESSES[name];

        setAddress(addr);
        setWalletName(name);
        setConnected(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: addr, walletName: name }));
        toast.success(`${name} connected`, {
          description: addr.slice(0, 6) + "\u2026" + addr.slice(-4),
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Connection failed";
        toast.error("Failed to connect", { description: msg });
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
    localStorage.removeItem(STORAGE_KEY);
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
