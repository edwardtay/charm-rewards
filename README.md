# CharmRewards ✨

> **Bitcoin-Native Loyalty Token Platform** powered by [Charms Protocol](https://charms.dev)

Programmable loyalty tokens on Bitcoin. Earn, redeem, and transfer tokens — all secured by zkVM proofs.

## Features

- 🔗 **Wallet Connection** — Xverse, Unisat, Leather support
- ⚡ **Gamification** — Streaks, achievements, leaderboard
- 🎰 **Daily Rewards** — Spin wheel + daily bonuses
- 🚀 **Cross-Chain** — Beam tokens to Cardano (demo)
- 🔬 **Technical Depth** — Live Rust contract + spell visualization

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  Wallet Connect │ Gamification │ Technical Visualization    │
└────────────────────────────┬────────────────────────────────┘
                             │ Generate Spells
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Charms SDK (Rust + zkVM)                   │
│  app_contract: Mint │ Burn │ Transfer │ Init                │
│  Verification: Supply cap, Authority, Conservation          │
└────────────────────────────┬────────────────────────────────┘
                             │ Submit Proof
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Bitcoin Network                          │
│  Enchanted UTXOs with REWA tokens                          │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

## Token Structure

| Property | Value |
|----------|-------|
| Ticker | REWA |
| Max Supply | 1,000,000 |
| Mint Authority | NFT holder |
| Burn | Rewards redemption |

## Proof Pipeline

```
User Action → Spell YAML → Rust Contract → zkVM Proof → Bitcoin TX
```

Each token operation creates a cryptographic proof verified on-chain.

## Project Structure

```
├── charm-app/           # Charms Backend
│   ├── src/lib.rs       # app_contract
│   └── spells/          # YAML templates
│
└── frontend/            # React Frontend
    └── src/App.jsx      # Full application
```

## Resources

- [Charms Docs](https://docs.charms.dev)
- [Charms GitHub](https://github.com/CharmsDev/charms)

---

Built with Charms Protocol on Bitcoin
