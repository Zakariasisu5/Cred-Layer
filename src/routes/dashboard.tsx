import { useEffect, useState } from "react";
import { fetchReputation, type WalletReputation } from "@/lib/api";

import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge, Stat } from "@/components/ui-cred";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { Activity, ShieldCheck, Sparkles } from "lucide-react";
import { useWallet, shortAddress } from "@/lib/wallet";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CredLayer" },
      {
        name: "description",
        content: "Wallet trust score, AI confidence, blockchain activity, and risk alerts.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { connected, address } = useWallet();
  const [reputation, setReputation] = useState<WalletReputation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !address) return;
    setLoading(true);
    fetchReputation(address)
      .then(setReputation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [connected, address]);

  if (!connected) return <Navigate to="/" />;

  const score = reputation?.score ?? 0;
  const signals = reputation?.signals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Wallet Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">{address ? shortAddress(address) : "Not connected"}</span> ·
            Solana Mainnet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <ShieldCheck className="w-3 h-3" /> Verified
          </Badge>
          <Badge variant="primary">
            <Sparkles className="w-3 h-3" /> Live Score
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-[200px] h-[200px] rounded-full border-2 border-dashed border-border animate-pulse" />
          ) : (
            <TrustScoreRing score={score} />
          )}
          <div className="mt-5 text-center">
            <Badge
              variant={
                score >= 81
                  ? "success"
                  : score >= 61
                    ? "primary"
                    : score >= 31
                      ? "warning"
                      : "danger"
              }
            >
              {reputation?.riskLabel ?? "Analyzing..."}
            </Badge>
            <p className="text-xs text-muted-foreground mt-3 max-w-xs">
              {reputation?.explanation ?? "Connect your wallet to see your trust score."}
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Score Breakdown"
            subtitle="5 criteria composing your trust score"
            action={
              <Badge variant="primary">
                <Activity className="w-3 h-3" /> Live
              </Badge>
            }
          />
          <div className="p-5 space-y-4">
            {reputation ? (
              Object.entries(reputation.breakdown).map(([key, value]) => {
                const labels: Record<string, string> = {
                  walletAge: "Wallet Age",
                  activity: "Transaction Activity",
                  defi: "DeFi Experience",
                  behavior: "Clean Behavior",
                  network: "Network Reach",
                };
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{labels[key] ?? key}</span>
                      <span className="font-mono text-muted-foreground">{value}/20</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(value / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Analyzing your wallet...</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <Stat label="Wallet Age" value={signals ? `${signals.walletAgeMonths}mo` : "—"} />
        </Card>
        <Card>
          <Stat label="Total Volume" value={signals ? `${signals.totalVolumeSOL} SOL` : "—"} />
        </Card>
        <Card>
          <Stat label="Tx Count" value={signals ? signals.transactionCount.toString() : "—"} />
        </Card>
        <Card>
          <Stat
            label="Risk Flags"
            value={signals?.suspiciousActivity ? "Yes" : "Clean"}
            deltaType={signals?.suspiciousActivity ? "down" : "up"}
          />
        </Card>
      </div>

      {reputation?.explanation && (
        <Card>
          <CardHeader
            title="AI Trust Insights"
            subtitle="Generated by CredLayer Reputation Engine"
          />
          <div className="p-5 pt-0">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-sm text-foreground/90 leading-relaxed">{reputation.explanation}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
