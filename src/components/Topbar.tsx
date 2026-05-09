import { Bell, Search, Menu } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { useState } from "react";
import { toast } from "sonner";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [q, setQ] = useState("");

  return (
    <header className="h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden w-10 h-10 grid place-items-center rounded-lg border border-border bg-card hover:bg-accent transition"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = q.trim();
          if (!v) return toast.error("Enter a wallet, tx, or contract");
          toast.message("Searching", { description: v });
        }}
        className="flex-1 max-w-xl relative"
      >
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search wallets, transactions, or contracts…"
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-input/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
      </form>

      <button
        onClick={() => toast.message("3 new alerts", { description: "Suspicious program interaction detected" })}
        className="relative w-10 h-10 grid place-items-center rounded-lg border border-border bg-card hover:bg-accent transition"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger animate-pulse" />
      </button>

      <WalletButton />
    </header>
  );
}
