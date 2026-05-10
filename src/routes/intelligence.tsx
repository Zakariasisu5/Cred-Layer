import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge } from "@/components/ui-cred";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Brain, ShieldAlert, Users, Activity, Bot } from "lucide-react";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "AI Risk Intelligence — CredLayer" },
      {
        name: "description",
        content: "Sybil detection, anomaly classification, and predictive risk intelligence.",
      },
    ],
  }),
  component: Intel,
});

const radar = [
  { k: "Sybil", a: 22 },
  { k: "Wash", a: 14 },
  { k: "Drainer", a: 8 },
  { k: "Bot", a: 35 },
  { k: "Mixer", a: 18 },
  { k: "Phish", a: 11 },
];

const pred = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i + 1}`,
  risk: 18 + Math.round(Math.sin(i / 2) * 8 + Math.random() * 5),
}));

function Intel() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            AI Risk Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Predictive intelligence powered by CredLayer's neural reputation engine.
          </p>
        </div>
        <Badge variant="primary">
          <Brain className="w-3 h-3" /> Model v4.2 · 99.1% precision
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Risk Vector Profile"
            subtitle="Multi-class threat surface for the active wallet"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="k"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <PolarRadiusAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                <Radar
                  dataKey="a"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Behavioral Class" subtitle="Classifier output" />
          <div className="p-5 pt-0 space-y-3">
            {[
              ["Retail User", 76],
              ["Power Trader", 18],
              ["Bot / Automated", 4],
              ["Sybil cluster", 2],
            ].map(([n, p]: any) => (
              <div key={n}>
                <div className="flex justify-between text-sm">
                  <span>{n}</span>
                  <span className="text-muted-foreground font-mono">{p}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="14-Day Risk Forecast"
          subtitle="Predicted probability of high-risk event"
        />
        <div className="h-64 px-2 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pred}>
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
              <Line
                type="monotone"
                dataKey="risk"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: "var(--color-primary)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            i: ShieldAlert,
            t: "Sybil Detection",
            v: "12",
            d: "clusters identified (24h)",
            c: "danger",
          },
          { i: Users, t: "Linked Wallets", v: "284", d: "in shared graph", c: "primary" },
          { i: Activity, t: "Anomalies", v: "0.42%", d: "of total traffic", c: "warning" },
        ].map((x, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg grid place-items-center bg-${x.c}/15`}>
                <x.i className={`w-5 h-5 text-${x.c}`} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{x.t}</div>
                <div className="text-xl font-semibold">{x.v}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-3">{x.d}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Reliability Indicators"
          subtitle="Signals contributing to overall trust"
          action={
            <Badge variant="primary">
              <Bot className="w-3 h-3" /> Auto-updated
            </Badge>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 pt-0">
          {[
            ["Wallet Age", "2.4 yrs", "success"],
            ["Tx Volume", "$2.1M", "success"],
            ["Unique CPs", "412", "success"],
            ["Failed Tx", "0.8%", "success"],
            ["Mixer Use", "None", "success"],
            ["Drainer Hits", "0", "success"],
            ["Cluster Density", "Low", "success"],
            ["Bot Score", "0.04", "success"],
          ].map(([l, v, c]: any) => (
            <div key={l} className="p-3 rounded-lg border border-border bg-elevated/40">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
              <div className={`mt-1 text-sm font-semibold text-${c}`}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
