import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Search, Brain, Trophy, Code2, Settings, Shield, X } from "lucide-react";
import logo from "@/assets/credlayer-logo.png";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reputation Analyzer", url: "/analyzer", icon: Search },
  { title: "AI Risk Intelligence", url: "/intelligence", icon: Brain },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Developer / API", url: "/developer", icon: Code2 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function Inner({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <img src={logo} alt="CredLayer" className="w-9 h-9 rounded-lg" />
        <div className="flex-1">
          <div className="text-base font-semibold tracking-tight text-gradient">CredLayer</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trust Protocol</div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="md:hidden w-8 h-8 grid place-items-center rounded-md hover:bg-accent" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = path === it.url;
          return (
            <Link
              key={it.url}
              to={it.url}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <it.icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
              <span>{it.title}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 p-4 rounded-xl glow-card">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-success" />
          Network: Solana Mainnet
        </div>
        <div className="mt-2 text-xs text-foreground/80">
          <span className="inline-block w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
          All systems operational
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl">
      <Inner />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col border-r border-sidebar-border bg-sidebar shadow-2xl animate-in slide-in-from-left">
        <Inner onNavigate={onClose} />
      </aside>
    </div>
  );
}
