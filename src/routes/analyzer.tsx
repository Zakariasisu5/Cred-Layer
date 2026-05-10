import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge, CredButton } from "@/components/ui-cred";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { Search, Sparkles, ShieldAlert, Network, FileCode, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { isValidSolanaAddress } from "@/lib/wallet";
import { toast } from "sonner";
import type { ReputationResult } from "@/lib/reputation-engine";
import { analyzeWallet } from "@/lib/reputation-engine";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Wallet Reputation Analyzer — CredLayer" },
      {
        name: "description",
        content:
          "Analyze any Solana wallet in real time — behavioral metrics, DeFi history, and AI-generated trust insights.",
      },
    ],
  }),
  component: Analyzer,
});

type ApiResult = ReputationResult & { ai_summary?: string; ai_error?: string };

const FLAG_LABEL: Record<string, { label: string; variant: "warning" | "danger" }> = {
  potential_sybil_cluster: { label: "Potential Sybil Cluster", variant: "danger" },
  abnormal_transaction_burst: { label: "Abnormal Tx Burst", variant: "danger" },
  unverified_program_interaction: { label: "Unverified Program", variant: "warning" },
  low_protocol_diversity: { label: "Low Protocol Diversity", variant: "warning" },
  elevated_failure_rate: { label: "Elevated Failure Rate", variant: "warning" },
  new_wallet: { label: "New Wallet", variant: "warning" },
  weak_repayment_history: { label: "Weak Repayment History", variant: "danger" },
};

const RISK_VARIANT: Record<
  ReputationResult["risk_level"],
  "success" | "primary" | "warning" | "danger"
> = {
  "Highly Trusted": "success",
  Trusted: "primary",
  "Medium Risk": "warning",
  "High Risk": "danger",
};

function Analyzer() {
  const [addr, setAddr] = useState("7xKXTg2CW87d97TXJSDpbD5jBkheTqA5q9oRd2HnJqB1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult>(() =>
    analyzeWallet("7xKXTg2CW87d97TXJSDpbD5jBkheTqA5q9oRd2HnJqB1"),
  );

  const onAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = addr.trim();
    if (!value) {
      setError("Wallet address is required");
      return;
    }
    if (!isValidSolanaAddress(value)) {
      setError("Invalid Solana wallet address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Analysis failed");
      setResult(data);
      toast.success(`Trust score: ${data.trust_score} · ${data.risk_level}`);
      if (data.ai_error) toast.warning(data.ai_error);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Reputation Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time AI analysis of any Solana wallet.
        </p>
      </div>

      <form onSubmit={onAnalyze}>
        <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
            <input
              value={addr}
              onChange={(e) => {
                setAddr(e.target.value);
                if (error) setError(null);
              }}
              className="flex-1 h-11 bg-transparent font-mono text-sm focus:outline-none min-w-0"
              placeholder="Paste a Solana wallet address…"
              maxLength={64}
              aria-invalid={!!error}
            />
          </div>
          <CredButton type="submit" loading={loading} size="lg">
            Analyze
          </CredButton>
        </Card>
        {error && <p className="text-xs text-danger mt-2 ml-2">{error}</p>}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 flex flex-col items-center">
          {loading ? (
            <div className="w-[200px] h-[200px] rounded-full border-2 border-dashed border-border animate-pulse" />
          ) : (
            <TrustScoreRing score={result.trust_score} />
          )}
          <Badge variant={RISK_VARIANT[result.risk_level]}>{result.risk_level}</Badge>
          <div className="mt-3 text-xs text-muted-foreground">
            AI Confidence ·{" "}
            <span className="text-foreground font-mono">
              {Math.round(result.confidence * 100)}%
            </span>
          </div>
          <div className="mt-4 text-xs font-mono text-muted-foreground break-all text-center">
            {result.wallet}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Behavioral Metrics" subtitle="AI-evaluated wallet behavior signals" />
          <div className="p-5 pt-0 space-y-4">
            {result.metrics.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/90">{m.label}</span>
                  <span className="font-mono text-muted-foreground">{m.value}/100</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: loading ? "0%" : `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Risk Flags"
            subtitle="Anomalies detected by the engine"
            action={<ShieldAlert className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="px-5 pb-5">
            {result.flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No risk flags detected. Wallet behavior is within normal distribution.
              </p>
            ) : (
              <ul className="space-y-2">
                {result.flags.map((f) => {
                  const meta = FLAG_LABEL[f] ?? { label: f, variant: "warning" as const };
                  return (
                    <li
                      key={f}
                      className="flex items-center justify-between p-3 rounded-lg bg-elevated/40 border border-border"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle
                          className={`w-4 h-4 ${meta.variant === "danger" ? "text-danger" : "text-warning"}`}
                        />
                        {meta.label}
                      </div>
                      <Badge variant={meta.variant}>{meta.variant.toUpperCase()}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="On-Chain Profile"
            subtitle="Engineered features powering the score"
            action={<Network className="w-4 h-4 text-muted-foreground" />}
          />
          <ul className="px-5 pb-5 space-y-2 text-sm">
            {[
              ["Wallet Age", `${result.features.walletAgeDays} days`],
              ["Tx Count", result.features.txCount.toLocaleString()],
              ["Tx / Day", result.features.txPerDay],
              ["Success Rate", `${(result.features.successRate * 100).toFixed(1)}%`],
              ["Total Volume", `${result.features.totalVolumeSol} SOL`],
              ["Unique Programs", result.features.uniqueProgramsCalled],
              ["DeFi Protocols", result.features.defiProtocols],
              ["Repayment Rate", `${(result.features.repaymentRate * 100).toFixed(1)}%`],
              ["Counterparties", result.features.uniqueCounterparties],
              ["Unverified Calls", result.features.unverifiedProgramCalls],
            ].map(([k, v]) => (
              <li
                key={k as string}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-elevated/30"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono">{v}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="AI Trust Insights"
          subtitle="Generated by CredLayer Reputation Engine"
          action={
            <Badge variant="primary">
              <Sparkles className="w-3 h-3" /> GPT-Trust v2
            </Badge>
          }
        />
        <div className="p-5 pt-0 space-y-3">
          {result.ai_summary && (
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <div className="text-xs uppercase tracking-wider text-primary mb-1">
                Executive Summary
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{result.ai_summary}</p>
            </div>
          )}
          {result.insights.map((t, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-elevated/40">
              <div className="w-8 h-8 shrink-0 rounded-md grid place-items-center bg-primary/15">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{t}</p>
            </div>
          ))}
          {result.flags.includes("unverified_program_interaction") && (
            <div className="flex gap-3 p-4 rounded-lg border border-warning/30 bg-warning/5">
              <FileCode className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm">
                Wallet interacted with {result.features.unverifiedProgramCalls} unverified
                program(s). Investigate before extending trust.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
