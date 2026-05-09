import { Navigate, createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardHeader, Badge, Stat } from "@/components/ui-cred";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
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

const trend = Array.from({ length: 24 }, (_, i) => ({
  t: `${i}:00`,
  score: 60 + Math.round(Math.sin(i / 3) * 8 + i * 0.8 + Math.random() * 4),
  ai: 70 + Math.round(Math.cos(i / 4) * 6 + i * 0.6),
}));

const activity = [
  { type: "Swap", from: "Jupiter", amount: "12.4 SOL", risk: "low", time: "2m ago" },
  { type: "Mint", from: "Magic Eden", amount: "1 NFT", risk: "low", time: "8m ago" },
  { type: "Transfer", from: "Unknown wallet", amount: "320 USDC", risk: "med", time: "21m ago" },
  { type: "Contract call", from: "Unverified program", amount: "—", risk: "high", time: "1h ago" },
  { type: "Stake", from: "Marinade", amount: "50 SOL", risk: "low", time: "3h ago" },
];

const interactions = Array.from({ length: 7 }, (_, i) => ({
  d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  defi: 20 + Math.round(Math.random() * 50),
  nft: 5 + Math.round(Math.random() * 25),
}));

function Dashboard() {
  const { connected, address } = useWallet();

  // Redirect to home if wallet is not connected
  if (!connected) {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Wallet Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">
              {connected && address ? shortAddress(address) : "Not connected"}
            </span>{" "}
            · Solana Mainnet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <ShieldCheck className="w-3 h-3" /> Verified
          </Badge>
          <Badge variant="primary">
            <Sparkles className="w-3 h-3" /> AI Confidence 94%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-center">
          <TrustScoreRing score={87} />
          <div className="mt-5 text-center">
            <Badge variant="success">Low Risk · Trusted</Badge>
            <p className="text-xs text-muted-foreground mt-3 max-w-xs">
              Score derived from 1.2K on-chain signals, behavioral history, and AI pattern analysis.
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Reputation Trend"
            subtitle="Last 24 hours · Trust score vs AI confidence"
            action={
              <Badge variant="primary">
                <Activity className="w-3 h-3" /> Live
              </Badge>
            }
          />
          <div className="h-64 px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <Stat label="Wallet Age" value="2.4 yrs" delta="Tier 3" />
        </Card>
        <Card>
          <Stat label="Total Value" value="$48.2K" delta="3.2%" deltaType="up" />
        </Card>
        <Card>
          <Stat label="Tx Count (30d)" value="412" delta="12%" deltaType="up" />
        </Card>
        <Card>
          <Stat label="Risk Flags" value="0" delta="Clean" deltaType="up" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Blockchain Activity"
            subtitle="Latest transactions and contract interactions"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-y border-border">
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Counterparty</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition">
                    <td className="px-5 py-3 font-medium">{a.type}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.from}</td>
                    <td className="px-5 py-3 font-mono">{a.amount}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          a.risk === "low" ? "success" : a.risk === "med" ? "warning" : "danger"
                        }
                      >
                        {a.risk.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Suspicious Activity"
            subtitle="AI-detected anomalies"
            action={
              <Badge variant="danger">
                <AlertTriangle className="w-3 h-3" /> 2 New
              </Badge>
            }
          />
          <div className="px-5 pb-5 space-y-3">
            {[
              {
                t: "Unverified program interaction",
                d: "Program ID: 4nT…vqz",
                v: "warning" as const,
                icon: AlertTriangle,
              },
              {
                t: "Unusual outbound transfer pattern",
                d: "3 wallets, 5 minutes apart",
                v: "danger" as const,
                icon: Zap,
              },
              {
                t: "AI flagged Sybil cluster proximity",
                d: "Confidence 71%",
                v: "warning" as const,
                icon: Cpu,
              },
            ].map((x, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border bg-elevated/50 flex gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-md grid place-items-center bg-${x.v === "danger" ? "danger" : "warning"}/15`}
                >
                  <x.icon
                    className={`w-4 h-4 ${x.v === "danger" ? "text-danger" : "text-warning"}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{x.t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{x.d}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Wallet Analytics" subtitle="DeFi & NFT interactions · last 7 days" />
        <div className="h-64 px-2 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interactions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="d"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="defi" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              <Bar
                dataKey="nft"
                fill="var(--color-primary)"
                fillOpacity={0.45}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
