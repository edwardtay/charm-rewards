# OPUS: Onchain Programmable UTXOs

**OPUS** is a Bitcoin-native protocol demonstrating **App-Specific Rollups** on BitcoinOS.
It enables programmable, stateful assets (Loyalty Tokens, Stablecoins, etc.) that live directly on Bitcoin L1 as UTXOs, but whose state transitions are governed by off-chain zero-knowledge proofs.

## 💎 Key Features
 
**1. Programmable UTXOs (SDK First)**
Built efficiently with **Charms SDK v0.10**, OPUS enables standard Bitcoin UTXOs to carry complex state (balances, tiers, history) without bloating the chain.
 
**2. Zero-Knowledge Logic**
All transaction rules (Mint/Burn) are enforced by **Rust Smart Contracts** executing in a zkVM. The blockchain verifies the *proof* of correctness, not the execution itself, allowing for infinite scalability.
 
**3. Native User Experience**
A fully functional React dashboard that feels like a modern web app but interacts directly with Bitcoin L1 via Xverse and Unisat. No bridges, no wrapped tokens.
 
**4. Real-World Utility**
Solves the "Loyalty Fragmentation" problem by turning points into interoperable Bitcoin assets that users actually own.

## 📐 Architecture

The protocol follows the **Spell -> Proof -> Verification** pipeline:

```mermaid
graph LR
    User[User Action] -->|Sign| App[Frontend]
    App -->|Generate Spell| ZK[ZK Prover]
    ZK -->|Verify Proof| BOS[BitcoinOS]
    BOS -->|Update UTXO| BTC[Bitcoin L1]
```

1.  **Spell (Action)**: User intents (Mint, Burn, Transfer) are serialized into a "Spell" (a compact state transition request).
2.  **ZK-Prover (Off-chain)**: The **Charms SDK** executes the Rust smart contract logic in a zkVM (SP1/Risc0). This generates a ZK proof attesting that the state transition follows the rules (e.g., "Sender has balance", "Supply < Max").
3.  **Verification (On-chain)**: The proof is batched and verified by the BitcoinOS BitSNARK verifier on Bitcoin L1.
4.  **Settlement**: If verified, the Bitcoin UTXO set is updated.

## 🚀 Live Demo (Testnet4)

The application is deployed on Bitcoin Testnet4.
*   **Mint**: Creates a new UTXO with embedded `OPUS` state.
*   **Burn**: Consumes the UTXO to redeem a reward, enforcing the "Burn" constraint in the contract.

## 📂 Project Structure

*   `frontend/`: React application with real-time ZK debugger visualization.
*   `charm-app/`: Rust smart contract logic defining the constraint system.

## 🔮 Future Roadmap

- [ ] **Merchant Portal**: No-code interface for brands to launch their own tokens.
- [ ] **Cross-Chain Bridge**: One-click "beam" to move loyalty points to Liquid sidechain.
- [ ] **Privacy Pools**: ZK-shielded transfers so competitors can't track brand volume.

## 🛠 Tech Stack

- **Contracts**: Rust, Charms SDK
- **Frontend**: React, Vite, Framer Motion
- **Wallets**: Sats Connect (Xverse), Unisat API
- **Design**: Glassmorphism UI, CSS Modules

---

Built on **BitcoinOS** + **Charms Protocol**
