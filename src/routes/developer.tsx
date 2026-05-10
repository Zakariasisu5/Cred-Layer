import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge, Stat, CredButton } from "@/components/ui-cred";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Code2, Key, Copy, Zap, CreditCard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "Developer Dashboard — CredLayer" },
      {
        name: "description",
        content: "API analytics, x402 payments, and trust score endpoints for builders.",
      },
    ],
  }),
  component: Dev,
});

const usage = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}`,
  calls: 800 + Math.round(Math.random() * 1400 + i * 30),
}));

function Dev() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Developer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build with CredLayer's reputation API and x402 micropayments.
          </p>
        </div>
        <Badge variant="primary">
          <Zap className="w-3 h-3" /> Pro Plan
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <Stat label="API Calls (30d)" value="284,921" delta="18%" deltaType="up" />
        </Card>
        <Card>
          <Stat label="Avg Latency" value="42 ms" delta="6 ms" deltaType="up" />
        </Card>
        <Card>
          <Stat label="x402 Revenue" value="$1,284" delta="12%" deltaType="up" />
        </Card>
        <Card>
          <Stat label="Error Rate" value="0.04%" delta="stable" />
        </Card>
      </div>

      <Card>
        <CardHeader title="API Usage" subtitle="Calls per day · last 30 days" />
        <div className="h-64 px-2 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usage}>
              <defs>
                <linearGradient id="usageG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="calls"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#usageG)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Trust Score Endpoint"
            subtitle="Quick start example"
            action={<Code2 className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="px-5 pb-5">
            <pre className="text-xs font-mono p-4 rounded-lg bg-elevated/60 border border-border overflow-x-auto leading-relaxed">
              {`POST https://api.credlayer.io/v1/score
Authorization: Bearer cl_live_***

{
  "wallet": "7xKXTg2CW87d97TXJSDpbD5jBkheT…",
  "chain": "solana"
}

→ {
  "score": 87,
  "risk": "low",
  "confidence": 0.94,
  "signals": 1284
}`}
            </pre>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="x402 Payment Integration"
            subtitle="Pay-per-query micropayments via HTTP 402"
            action={<CreditCard className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="px-5 pb-5 space-y-3 text-sm">
            <p className="text-muted-foreground">
              CredLayer supports the x402 standard for autonomous AI agents to pay per API call
              without API keys.
            </p>
            <div className="p-3 rounded-lg bg-elevated/60 border border-border font-mono text-xs">
              HTTP/1.1 402 Payment Required
              <br />
              X-Payment: solana://CredLayer.x402…
              <br />
              Price: 0.0001 SOL / call
            </div>
            <CredButton
              onClick={() => toast.success("x402 enabled for your keys")}
              className="w-full"
            >
              Enable x402 for my keys
            </CredButton>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            name: "Starter",
            price: "$0",
            calls: "1K calls/mo",
            per: "Free forever",
            v: "default" as const,
          },
          {
            name: "Pro",
            price: "$49",
            calls: "100K calls/mo",
            per: "$0.0004 / extra call",
            v: "primary" as const,
            hot: true,
          },
          {
            name: "Enterprise",
            price: "Custom",
            calls: "Unlimited",
            per: "SLA + private model",
            v: "default" as const,
          },
        ].map((p) => (
          <Card key={p.name} className={`p-6 relative ${p.hot ? "ring-1 ring-primary/40" : ""}`}>
            {p.hot && (
              <div className="absolute -top-2 right-4">
                <Badge variant="primary">Most popular</Badge>
              </div>
            )}
            <div className="text-sm text-muted-foreground">{p.name}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
              {p.price}
              <span className="text-sm text-muted-foreground font-normal">/mo</span>
            </div>
            <div className="mt-1 text-sm">{p.calls}</div>
            <div className="mt-1 text-xs text-muted-foreground">{p.per}</div>
            <CredButton
              onClick={() => toast.success(`${p.name} plan selected`)}
              variant={p.hot ? "primary" : "outline"}
              className="mt-5 w-full"
            >
              Choose {p.name}
            </CredButton>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="API Keys"
          subtitle="Manage credentials"
          action={
            <CredButton size="sm" onClick={() => toast.success("New API key generated")}>
              + New key
            </CredButton>
          }
        />
        <div className="px-5 pb-5 space-y-2">
          {[
            { name: "Production", key: "cl_live_8f3d…a91k", env: "Live" },
            { name: "Staging", key: "cl_test_b27e…m4qx", env: "Test" },
          ].map((k) => (
            <div
              key={k.name}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-elevated/40"
            >
              <Key className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{k.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{k.key}</div>
              </div>
              <Badge variant={k.env === "Live" ? "success" : "warning"}>{k.env}</Badge>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(k.key);
                  toast.success("Key copied");
                }}
                className="w-8 h-8 grid place-items-center rounded-md hover:bg-accent"
                aria-label="Copy key"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
