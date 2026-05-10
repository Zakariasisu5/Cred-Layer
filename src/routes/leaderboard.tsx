import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, Badge } from "@/components/ui-cred";
import { Trophy, TrendingUp, Bot, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/api";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Reputation Leaderboard — CredLayer" },
      { name: "description", content: "Top trusted wallets and AI agent rankings." },
    ],
  }),
  component: LB,
});

function LB() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard()
      .then((data) => setEntries(data.leaderboard))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getTier = (score: number) => {
    if (score >= 81) return "Elite";
    if (score >= 61) return "Trusted";
    return "Active";
  };

  const shortAddr = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Reputation Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          The most trusted wallets and AI agents on Solana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            i: Trophy,
            t: "Top Trusted",
            v: entries.filter((e) => e.score >= 81).length.toString(),
            d: "wallets > 80 score",
            c: "gold",
          },
          {
            i: TrendingUp,
            t: "Analyzed",
            v: entries.length.toString(),
            d: "wallets tracked",
            c: "success",
          },
          {
            i: Bot,
            t: "High Risk",
            v: entries.filter((e) => e.score < 31).length.toString(),
            d: "wallets flagged",
            c: "primary",
          },
        ].map((x, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg grid place-items-center"
                style={{ background: "var(--gradient-primary)" }}
              >
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
        <CardHeader
          title="Top Trusted Wallets"
          subtitle="Ranked by composite trust score"
          action={<Badge variant="primary">Live</Badge>}
        />

        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading leaderboard...</span>
          </div>
        )}

        {error && <div className="p-6 text-center text-sm text-danger">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-y border-border">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Wallet</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Last Updated</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((r) => (
                  <tr
                    key={r.rank}
                    className="border-b border-border/50 hover:bg-accent/30 transition"
                  >
                    <td className="px-5 py-3">
                      <span
                        className={`inline-grid place-items-center w-7 h-7 rounded-md text-xs font-semibold ${r.rank <= 3 ? "text-primary-foreground" : "bg-muted text-foreground"}`}
                        style={r.rank <= 3 ? { background: "var(--gradient-primary)" } : {}}
                      >
                        {r.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono">{shortAddr(r.wallet)}</td>
                    <td className="px-5 py-3 font-semibold text-gradient">{r.score}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {new Date(r.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          getTier(r.score) === "Elite"
                            ? "primary"
                            : getTier(r.score) === "Trusted"
                              ? "success"
                              : "default"
                        }
                      >
                        {getTier(r.score)}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                      No wallets analyzed yet. Use the Analyzer to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
