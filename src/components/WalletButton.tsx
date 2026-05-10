import { useState } from "react";
import { useWallet, shortAddress } from "@/lib/wallet";
import { Wallet, Loader2, LogOut, Check, Copy } from "lucide-react";
import { toast } from "sonner";

const wallets = [
  { name: "Phantom" as const, accent: "from-purple-400 to-fuchsia-500" },
  { name: "Solflare" as const, accent: "from-orange-400 to-amber-500" },
  { name: "Backpack" as const, accent: "from-red-400 to-rose-500" },
];

export function WalletButton() {
  const { connected, connecting, address, walletName, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (connected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="h-10 px-3 sm:px-4 rounded-lg text-sm font-medium btn-primary btn-primary-hover flex items-center gap-2"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline font-mono">{shortAddress(address)}</span>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 rounded-xl glow-card p-2 z-50">
              <div className="px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {walletName}
                </div>
                <div className="font-mono text-xs text-foreground/90 break-all mt-1">{address}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/60"
              >
                <Copy className="w-4 h-4" /> Copy address
              </button>
              <button
                onClick={() => {
                  disconnect();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/60 text-danger"
              >
                <LogOut className="w-4 h-4" /> Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={connecting}
        className="h-10 px-4 rounded-lg text-sm font-medium btn-primary btn-primary-hover flex items-center gap-2"
      >
        {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
        <span className="hidden sm:inline">{connecting ? "Connecting…" : "Connect Wallet"}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl glow-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-base font-semibold">Connect a wallet</div>
            <div className="text-xs text-muted-foreground mt-1">
              Solana Mainnet · choose your provider
            </div>
            <div className="mt-4 space-y-2">
              {wallets.map((w) => (
                <button
                  key={w.name}
                  onClick={async () => {
                    await connect(w.name);
                    setOpen(false);
                  }}
                  disabled={connecting}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/60 hover:bg-accent/40 transition disabled:opacity-50"
                >
                  <div
                    className={`w-9 h-9 rounded-md grid place-items-center bg-gradient-to-br ${w.accent}`}
                  >
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-medium flex-1 text-left">{w.name}</div>
                  {connecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Check className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full h-10 rounded-lg text-sm border border-border hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
