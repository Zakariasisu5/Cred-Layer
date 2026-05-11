import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge, CredButton } from "@/components/ui-cred";
import { Wallet, Bell, Palette, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/wallet-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CredLayer" },
      { name: "description", content: "Wallet connection, notifications, theme, and security." },
    ],
  }),
  component: SettingsPage,
});

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

function ToggleList({ items }: { items: string[] }) {
  const [state, setState] = useState<boolean[]>(items.map((_, i) => i % 3 !== 2));
  return (
    <div className="px-5 pb-5 divide-y divide-border">
      {items.map((l, i) => (
        <div key={l} className="flex items-center justify-between py-3">
          <span className="text-sm">{l}</span>
          <Toggle
            label={l}
            on={state[i]}
            onChange={(v) => {
              setState((s) => s.map((x, j) => (j === i ? v : x)));
              toast.success(`${l}: ${v ? "On" : "Off"}`);
            }}
          />
        </div>
      ))}
    </div>
  );
}

function SettingsPage() {
  const { connected, address, walletName, disconnect } = useWallet();
  const [theme, setTheme] = useState(0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, wallet and preferences.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Wallet Connection"
          subtitle="Connected Solana wallets"
          action={<Wallet className="w-4 h-4 text-muted-foreground" />}
        />
        <div className="px-5 pb-5 space-y-3">
          {connected && address ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-elevated/40">
              <div className="w-9 h-9 rounded-md grid place-items-center btn-primary">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{walletName}</div>
                <div className="text-xs font-mono text-muted-foreground truncate">
                  {shortAddress(address)}
                </div>
              </div>
              <Badge variant="primary">Primary</Badge>
              <CredButton size="sm" variant="outline" onClick={disconnect}>
                Disconnect
              </CredButton>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-border text-sm text-muted-foreground text-center">
              No wallet connected. Use the Connect Wallet button in the top-right to link Phantom,
              Solflare, or Backpack.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Notifications"
          subtitle="What you want to hear about"
          action={<Bell className="w-4 h-4 text-muted-foreground" />}
        />
        <ToggleList
          items={[
            "Suspicious activity alerts",
            "Trust score changes",
            "Weekly reputation summary",
            "AI insight digests",
            "API quota warnings",
          ]}
        />
      </Card>

      <Card>
        <CardHeader
          title="Theme"
          subtitle="Visual preferences"
          action={<Palette className="w-4 h-4 text-muted-foreground" />}
        />
        <div className="px-5 pb-5 grid grid-cols-3 gap-3">
          {["Midnight", "Cobalt", "Carbon"].map((t, i) => (
            <button
              key={t}
              onClick={() => {
                setTheme(i);
                toast.success(`${t} theme selected`);
              }}
              className={`p-4 rounded-lg border text-left transition ${theme === i ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-primary/40"} bg-elevated/40`}
            >
              <div
                className="h-12 rounded-md mb-2 btn-primary"
                style={{ opacity: 0.8 - i * 0.2 }}
              />
              <div className="text-sm font-medium">{t}</div>
              <div className="text-xs text-muted-foreground">
                {theme === i ? "Active" : "Available"}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Security"
          subtitle="Account & API protections"
          action={<ShieldCheck className="w-4 h-4 text-success" />}
        />
        <ToggleList
          items={[
            "Two-factor authentication",
            "Require signature for high-risk actions",
            "Session lock after inactivity",
            "Allow third-party API integrations",
          ]}
        />
      </Card>
    </div>
  );
}
