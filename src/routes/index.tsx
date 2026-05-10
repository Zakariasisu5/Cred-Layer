import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  Brain,
  Users,
  Lock,
  EyeOff,
  Server,
  ArrowRight,
  Wallet,
  CheckCircle2,
  Cpu,
  Building2,
  Code2,
  Bot,
} from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { WalletButton } from "@/components/WalletButton";
import logo from "@/assets/credlayer-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CredLayer — On-chain Trust & Reputation Protocol for Solana" },
      {
        name: "description",
        content:
          "CredLayer analyzes wallet behavior on Solana and generates explainable trust scores for wallets and AI agents. Connect your wallet to view your reputation.",
      },
      {
        property: "og:title",
        content: "CredLayer — On-chain Trust & Reputation Protocol for Solana",
      },
      {
        property: "og:description",
        content:
          "Decentralized reputation infrastructure for Solana wallets and autonomous agents.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { connected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) navigate({ to: "/dashboard" });
  }, [connected, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="CredLayer" className="w-8 h-8 rounded-md" />
            <span className="text-base font-semibold tracking-tight">CredLayer</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 ml-8 text-sm text-muted-foreground">
            <a href="#product" className="hover:text-foreground transition">
              Product
            </a>
            <a href="#how" className="hover:text-foreground transition">
              How it works
            </a>
            <a href="#security" className="hover:text-foreground transition">
              Security
            </a>
            <a href="#audience" className="hover:text-foreground transition">
              Use cases
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-70"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live on Solana · Reputation Protocol
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              On-chain trust,
              <br />
              <span className="text-gradient">made measurable.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Analyze your wallet reputation and trust score on Solana. CredLayer turns on-chain
              behavior into explainable risk and reliability signals for wallets and AI agents.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WalletButton />
              <a
                href="#how"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition"
              >
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Non-custodial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-success" /> Read-only access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-success" /> Wallet signature only
              </span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div
              className="absolute -inset-10 -z-10 rounded-[3rem] blur-3xl opacity-40"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div className="glow-card rounded-2xl p-8 md:p-10">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Wallet Trust Profile
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> Verified signal
                </span>
              </div>
              <div className="mt-8 grid place-items-center">
                <TrustVisual />
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Behavior", icon: Activity },
                  { label: "Counterparty", icon: Users },
                  { label: "AI Signals", icon: Brain },
                ].map((x) => (
                  <div key={x.label} className="p-3 rounded-lg border border-border bg-card/60">
                    <x.icon className="w-4 h-4 mx-auto text-primary" />
                    <div className="mt-1.5 text-[11px] text-muted-foreground">{x.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section id="product" className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary">
              What CredLayer gives you
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              A clear picture of who you transact with.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Reputation is the missing layer of decentralized finance. CredLayer surfaces the
              signals you need to act with confidence.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: "Understand your reputation",
                desc: "Get an explainable trust score derived from real on-chain behavior.",
              },
              {
                icon: Activity,
                title: "Detect suspicious activity",
                desc: "Spot anomalies, sybil patterns, and risky counterparties early.",
              },
              {
                icon: Brain,
                title: "Improve DeFi participation",
                desc: "Demonstrate reliability to protocols, lenders, and agents.",
              },
              {
                icon: CheckCircle2,
                title: "Verify before you transact",
                desc: "Check any wallet's reliability before financial interactions.",
              },
            ].map((v) => (
              <div key={v.title} className="glow-card rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary/15 border border-primary/25">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-4 text-sm font-semibold">{v.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60 bg-card/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-widest text-primary">How it works</div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                From wallet to trust score in seconds.
              </h2>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                icon: Wallet,
                title: "Connect your Solana wallet",
                desc: "Phantom, Solflare, or Backpack — read-only and non-custodial.",
              },
              {
                n: "02",
                icon: Cpu,
                title: "CredLayer analyzes behavior",
                desc: "Wallet age, counterparties, protocol diversity, and AI pattern signals.",
              },
              {
                n: "03",
                icon: ShieldCheck,
                title: "Get your trust score & insights",
                desc: "Explainable risk classification with actionable behavioral signals.",
              },
            ].map((s) => (
              <div key={s.n} className="glow-card rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-5 text-5xl font-semibold text-primary/10 tracking-tight">
                  {s.n}
                </div>
                <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary/15 border border-primary/25 relative">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-4 text-sm font-semibold relative">{s.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed relative">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Trust & security</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Designed to be trusted by default.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl">
              CredLayer never moves your assets. We analyze public on-chain data and use a wallet
              signature only to verify ownership.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Activity,
                title: "Wallet data analysis only",
                desc: "We read public on-chain activity. Nothing more.",
              },
              {
                icon: Lock,
                title: "No custody of funds",
                desc: "CredLayer cannot move, sign, or hold any assets.",
              },
              {
                icon: ShieldCheck,
                title: "Secure wallet connection",
                desc: "Standard wallet adapter flow with explicit user approval.",
              },
              {
                icon: EyeOff,
                title: "Privacy-respecting",
                desc: "Minimal metadata, no off-chain tracking of personal data.",
              },
            ].map((s) => (
              <div key={s.title} className="rounded-xl p-5 border border-border bg-card/60">
                <s.icon className="w-5 h-5 text-primary" />
                <div className="mt-3 text-sm font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="audience" className="border-t border-border/60 bg-card/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary">Why CredLayer</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Built for the new shape of finance.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you're a wallet holder, a protocol team, or an autonomous agent, reputation is
              becoming infrastructure.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Wallet,
                title: "Wallet holders",
                desc: "Understand and grow your on-chain reputation.",
              },
              {
                icon: Building2,
                title: "DeFi users",
                desc: "Vet counterparties before lending, swapping, or staking.",
              },
              {
                icon: Code2,
                title: "Builders & protocols",
                desc: "Integrate trust signals into your product surface.",
              },
              {
                icon: Bot,
                title: "AI agents",
                desc: "Give autonomous systems a reliable signal to act on.",
              },
            ].map((a) => (
              <div key={a.title} className="glow-card rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary/15 border border-primary/25">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-4 text-sm font-semibold">{a.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="glow-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{ background: "var(--gradient-glow)" }}
            />
            <h3 className="text-2xl md:text-4xl font-semibold tracking-tight">
              See what your wallet says about you.
            </h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Connect a Solana wallet to view your trust score, behavioral signals, and AI-generated
              insights.
            </p>
            <div className="mt-6 flex justify-center">
              <WalletButton />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-auto">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="CredLayer" className="w-7 h-7 rounded-md" />
              <span className="font-semibold">CredLayer</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground max-w-xs leading-relaxed">
              Decentralized reputation infrastructure for Solana wallets and autonomous agents.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: "Analyzer", to: "/analyzer" },
              { label: "Intelligence", to: "/intelligence" },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { label: "Documentation", to: "/developer" },
              { label: "Leaderboard", to: "/leaderboard" },
              { label: "Settings", to: "/settings" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#product" },
              { label: "Contact", href: "mailto:hello@credlayer.xyz" },
              { label: "Twitter / X", href: "#" },
              { label: "GitHub", href: "#" },
            ]}
          />
        </div>
        <div className="border-t border-border/60">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} CredLayer. All rights reserved.</div>
            <div className="inline-flex items-center gap-2">
              <Server className="w-3.5 h-3.5" /> Solana Mainnet
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to?: string; href?: string }[];
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-foreground/80">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="text-muted-foreground hover:text-foreground transition">
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className="text-muted-foreground hover:text-foreground transition">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustVisual() {
  // Abstract concentric trust rings — no fake numbers
  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[280px] h-auto">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="140"
        cy="140"
        r="130"
        fill="none"
        stroke="var(--color-border)"
        strokeDasharray="2 6"
      />
      <circle cx="140" cy="140" r="100" fill="none" stroke="var(--color-border)" />
      <circle cx="140" cy="140" r="70" fill="none" stroke="url(#ringGrad)" strokeWidth="2" />
      <circle cx="140" cy="140" r="55" fill="url(#coreGrad)" />
      <g stroke="var(--color-primary)" strokeOpacity="0.35">
        <line x1="140" y1="10" x2="140" y2="40" />
        <line x1="140" y1="240" x2="140" y2="270" />
        <line x1="10" y1="140" x2="40" y2="140" />
        <line x1="240" y1="140" x2="270" y2="140" />
      </g>
      <g fill="var(--color-primary)">
        <circle cx="140" cy="40" r="3" />
        <circle cx="240" cy="140" r="3" />
        <circle cx="140" cy="240" r="3" />
        <circle cx="40" cy="140" r="3" />
      </g>
      <g
        transform="translate(140 140)"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M-18 2 L-4 16 L20 -12" />
      </g>
    </svg>
  );
}
