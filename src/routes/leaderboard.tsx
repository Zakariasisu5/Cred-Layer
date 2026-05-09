import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge } from "@/components/ui-cred";
import { Trophy, TrendingUp, Bot } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Reputation Leaderboard — CredLayer" },
      { name: "description", content: "Top trusted wallets, fastest growers, and AI agent rankings." },
    ],
  }),
  component: LB,
});

const top = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  addr: `${["7xKX","9pNm","Bv4j","Cz8L","Dk3w","Ev7q","Fh2r","Gi5s","Hj9t","Kx1u"][i]}…${["aP9q","b3Lk","mP2x","nQ4y","oR5z","pS6a","qT7b","rU8c","sV9d","tW0e"][i]}`,
  score: 99 - i,
  growth: `+${(12 - i * 0.7).toFixed(1)}%`,
  tag: i < 3 ? "Elite" : i < 6 ? "Trusted" : "Active",
}));

function LB() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Reputation Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">The most trusted wallets and AI agents on Solana.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { i: Trophy, t: "Top Trusted", v: "9,421", d: "wallets > 90 score", c: "gold" },
          { i: TrendingUp, t: "Highest Growth", v: "+18.4%", d: "avg this week", c: "success" },
          { i: Bot, t: "AI Agents Tracked", v: "1,284", d: "autonomous wallets", c: "primary" },
        ].map((x, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
                <x.i className="w-5 h-5 text-primary-foreground" />
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
        <CardHeader title="Top Trusted Wallets" subtitle="Ranked by composite trust score" action={<Badge variant="primary">Live</Badge>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-y border-border">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Wallet</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">7d Growth</th>
                <th className="px-5 py-3 font-medium">Tier</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r) => (
                <tr key={r.rank} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="px-5 py-3">
                    <span className={`inline-grid place-items-center w-7 h-7 rounded-md text-xs font-semibold ${r.rank <= 3 ? "text-primary-foreground" : "bg-muted text-foreground"}`}
                      style={r.rank <= 3 ? { background: "var(--gradient-primary)" } : {}}>
                      {r.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono">{r.addr}</td>
                  <td className="px-5 py-3 font-semibold text-gradient">{r.score}</td>
                  <td className="px-5 py-3 text-success font-medium">{r.growth}</td>
                  <td className="px-5 py-3">
                    <Badge variant={r.tag === "Elite" ? "primary" : r.tag === "Trusted" ? "success" : "default"}>{r.tag}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
