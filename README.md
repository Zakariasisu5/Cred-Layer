# 🛡️ CredLayer

> **AI-Powered Trust Infrastructure for Web3**  
> Decentralized reputation protocol on Solana — wallet trust scores, AI risk intelligence, and behavioral analytics for autonomous finance.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://credlayer.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=for-the-badge&logo=solana)](https://solana.com)

---

## 🎯 The Problem

In decentralized finance, **trust is invisible**. You can't tell if a wallet is:
- A legitimate user or a bot
- Part of a Sybil attack cluster
- Reliable for lending protocols
- Safe to transact with

Traditional credit scores don't exist on-chain, and wallet addresses reveal nothing about behavior or reliability.

## 💡 Our Solution

**CredLayer** is a decentralized reputation engine that transforms on-chain behavior into **explainable trust scores**. We analyze:

- 📊 **Transaction patterns** — volume, frequency, success rates
- 🤝 **Counterparty quality** — who you interact with matters
- 🏦 **DeFi participation** — protocol diversity and repayment history
- 🤖 **AI risk signals** — Sybil detection, anomaly classification, bot scoring
- ⚡ **Real-time analysis** — instant reputation insights for any Solana wallet

---

## ✨ Key Features

### 🎯 **Wallet Reputation Analyzer**
Analyze any Solana wallet in real-time with AI-powered insights:
- Trust score (0-100) with risk classification
- Behavioral metrics and on-chain profile
- AI-generated explainability layer
- Risk flags and anomaly detection

### 🧠 **AI Risk Intelligence**
Advanced threat detection powered by neural reputation engine:
- Multi-class risk vector profiling
- Sybil cluster detection
- 14-day risk forecasting
- Behavioral classification (retail, trader, bot, Sybil)

### 📈 **Personal Dashboard**
Track your own wallet's reputation:
- Real-time trust score monitoring
- Transaction history analysis
- Suspicious activity alerts
- Reputation trend visualization

### 🏆 **Reputation Leaderboard**
Discover the most trusted wallets on Solana:
- Top trusted wallets ranked by composite score
- Fastest growing reputations
- AI agent tracking

### 🔧 **Developer API**
Build trust into your protocol:
- RESTful API for trust score queries
- x402 micropayment support for AI agents
- Real-time reputation webhooks
- Comprehensive documentation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CredLayer Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   API Layer  │  │  AI Engine   │      │
│  │  React + TS  │◄─┤  TanStack    │◄─┤  GPT-Trust   │      │
│  │  TailwindCSS │  │  Start       │  │  v2          │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │  Reputation Engine │                       │
│                  │  (Rule-based MVP)  │                       │
│                  └─────────┬─────────┘                       │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │ Solana Smart      │                       │
│                  │ Contract (Rust)   │                       │
│                  │ • On-chain Storage│                       │
│                  │ • PDA Accounts    │                       │
│                  │ • Trust Scores    │                       │
│                  └───────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- ⚛️ React 19 + TypeScript
- 🎨 TailwindCSS 4 + Radix UI
- 🚀 TanStack Router + Start (SSR)
- 📊 Recharts for data visualization
- 🔗 Wallet adapters (Phantom, Solflare, Backpack)

**Backend:**
- 🌐 TanStack Start (SSR + API routes)
- 🤖 Vercel AI SDK for LLM integration
- 🦀 **Rust + Anchor for Solana smart contracts**
- 🔗 **Solana Web3.js for blockchain integration**
- 🔐 Supabase for authentication (future)
- ☁️ Deployed on Vercel/Cloudflare

**Blockchain:**
- ⚡ Solana Mainnet/Devnet
- 🦀 **Rust smart contract with Anchor framework**
- 🔐 **PDA-based reputation accounts**
- 💾 **On-chain trust score storage**
- 🔗 Web3.js integration
- 💳 Wallet connection via standard adapters

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- npm or yarn
- A Solana wallet (Phantom, Solflare, or Backpack)
- **Rust and Solana CLI (for smart contract development)**

### Frontend Installation

```bash
# Clone the repository
git clone https://github.com/Zakariasisu5/Cred-Layer.git
cd Cred-Layer

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your environment variables
# SUPABASE_URL=your_supabase_url
# SUPABASE_PUBLISHABLE_KEY=your_supabase_key
# LOVABLE_API_KEY=your_lovable_api_key (optional)

# Start development server
npm run dev
```

Visit `http://localhost:3000` and connect your wallet!

### Smart Contract Setup

```bash
# Run the automated setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or follow the manual setup in SOLANA_SETUP.md
```

### Build Smart Contract

```bash
# Build the Solana program
npm run anchor:build

# Run tests
npm run anchor:test

# Deploy to devnet
npm run solana:deploy:devnet
```

For detailed smart contract setup, see [SOLANA_SETUP.md](./SOLANA_SETUP.md)

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

---

## 🎮 How to Use

### 1️⃣ **Connect Your Wallet**
Click "Connect Wallet" and choose your Solana wallet (Phantom, Solflare, or Backpack).

### 2️⃣ **View Your Dashboard**
See your trust score, behavioral metrics, and AI-generated insights.

### 3️⃣ **Analyze Any Wallet**
Go to the Analyzer page and paste any Solana wallet address for instant reputation analysis.

### 4️⃣ **Explore Intelligence**
Check out AI risk intelligence, Sybil detection, and predictive risk forecasting.

### 5️⃣ **Check the Leaderboard**
See the most trusted wallets and fastest-growing reputations on Solana.

---

## 🧪 Reputation Engine

### How We Calculate Trust Scores

Our deterministic reputation engine analyzes multiple behavioral signals:

**Positive Signals (0-100):**
- 📅 Wallet age (older = more trusted)
- 📈 Transaction activity (consistent usage)
- ✅ Success rate (reliable transactions)
- 🌐 Protocol diversity (broad DeFi participation)
- 💰 Repayment history (lending reliability)
- 🤝 Counterparty quality (who you interact with)

**Risk Penalties (0-100):**
- ⚡ Transaction bursts (bot-like behavior)
- 👥 Sybil cluster proximity (linked wallets)
- ⚠️ Unverified program calls (risky interactions)
- ❌ Failed transaction ratio (unreliable behavior)

**Final Score:**
```
Trust Score = Σ(Positive Signals × Weights) - Σ(Risk Penalties × 0.45)
```

### Risk Classification

- 🟢 **Highly Trusted** (81-100): Elite wallets with proven track record
- 🔵 **Trusted** (61-80): Reliable wallets with good behavior
- 🟡 **Medium Risk** (31-60): Average wallets, proceed with caution
- 🔴 **High Risk** (0-30): Suspicious activity detected

---

## 🎯 Use Cases

### For Wallet Holders
- 📊 Understand your on-chain reputation
- 🚀 Improve your trust score over time
- 🔍 Verify counterparties before transactions

### For DeFi Protocols
- 🏦 Assess borrower reliability for lending
- 🛡️ Detect Sybil attacks in airdrops
- 📈 Reward high-reputation users

### For Developers
- 🔌 Integrate trust scores via API
- 🤖 Enable AI agents with reputation signals
- 💳 Accept x402 micropayments

### For AI Agents
- 🤖 Autonomous trust verification
- 💰 Pay-per-query via x402 standard
- 🔐 No API keys required

---

## 🛣️ Roadmap

### ✅ Phase 1: MVP (Current)
- [x] Rule-based reputation engine
- [x] Wallet analyzer with AI insights
- [x] Personal dashboard
- [x] Leaderboard
- [x] Developer API structure
- [x] **Solana smart contract (Rust + Anchor)**
- [x] **On-chain reputation storage**
- [x] **PDA-based account system**

### 🚧 Phase 2: Live Integration (Next)
- [ ] Deploy smart contract to devnet
- [ ] Real Solana RPC integration
- [ ] Live transaction monitoring
- [ ] Historical data analysis
- [ ] Supabase authentication
- [ ] User profiles and history
- [ ] Backend integration with on-chain data

### 🔮 Phase 3: Advanced Features
- [ ] Machine learning reputation model
- [ ] Cross-chain reputation (EVM support)
- [ ] Reputation NFTs (on-chain credentials)
- [ ] DAO governance for scoring weights
- [ ] Reputation staking and insurance

### 🌟 Phase 4: Ecosystem
- [ ] Protocol partnerships
- [ ] SDK for easy integration
- [ ] Reputation marketplace
- [ ] AI agent network
- [ ] Decentralized reputation oracle

---

## 🏆 Hackathon Highlights

### Innovation
- 🧠 **AI-powered explainability** — Not just scores, but insights
- 🤖 **x402 micropayments** — Built for autonomous agents
- 🔍 **Real-time analysis** — Instant reputation for any wallet
- 🎯 **Multi-dimensional scoring** — Beyond simple metrics
- 🦀 **On-chain storage** — Decentralized reputation on Solana
- 🔐 **PDA security** — Secure, verifiable reputation accounts

### Technical Excellence
- ⚡ **Modern stack** — React 19, TanStack Start, TypeScript
- 🎨 **Beautiful UI** — Polished design with Radix UI + TailwindCSS
- 🚀 **SSR-ready** — Fast, SEO-friendly, production-ready
- 📱 **Fully responsive** — Works on all devices

### Impact
- 🌐 **Solves real problems** — Trust is critical in DeFi
- 📈 **Scalable solution** — API-first architecture
- 🤝 **Ecosystem-friendly** — Easy integration for protocols
- 🔮 **Future-proof** — Built for AI agent economy

---

## 👥 Team

Built with ❤️ by passionate Web3 developers who believe reputation is the missing layer of decentralized finance.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** for the incredible blockchain infrastructure
- **TanStack** for the amazing React framework
- **Radix UI** for accessible component primitives
- **Vercel** for seamless deployment
- **The Web3 community** for inspiration and support

---

## 🔗 Links

- 🌐 **Live Demo**: [credlayer.vercel.app](https://credlayer.vercel.app)
- 📚 **Smart Contract Setup**: [SOLANA_SETUP.md](./SOLANA_SETUP.md)
- 🔌 **Backend Integration**: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
- 🚀 **Deployment Guide**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
- 🐦 **Twitter**: [@CredLayer](https://twitter.com/credlayer)
- 💬 **Discord**: [Join our community](https://discord.gg/credlayer)

---

<div align="center">

**⭐ Star us on GitHub — it helps!**

Made with 🛡️ by CredLayer Team

[Report Bug](https://github.com/Zakariasisu5/Cred-Layer/issues) · [Request Feature](https://github.com/Zakariasisu5/Cred-Layer/issues)

</div>
