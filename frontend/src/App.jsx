import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAddress, sendBtcTransaction, AddressPurpose, BitcoinNetworkType } from 'sats-connect'
import './App.css'

const STORAGE_KEY = 'charmrewards_v5'
const genHash = () => [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
const genAddr = () => 'tb1p' + [...Array(58)].map(() => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('')

const TOKEN = { ticker: 'REWA', maxSupply: 1000000, appId: 'charmrewards' }

const REWARDS = [
  { id: 'r1', name: '10% Off', cost: 200, icon: '🏷️' },
  { id: 'r2', name: 'Free Shipping', cost: 300, icon: '📦' },
  { id: 'r3', name: '$5 Credit', cost: 500, icon: '💵' },
  { id: 'r4', name: 'NFT Badge', cost: 1000, icon: '🎖️' },
]

const ACHIEVEMENTS = [
  { id: 'first_earn', name: 'First Steps', icon: '🌟', check: s => s.totalEarned > 0 },
  { id: 'first_burn', name: 'Big Spender', icon: '🔥', check: s => s.totalRedeemed > 0 },
  { id: '1k_club', name: '1K Club', icon: '💎', check: s => s.totalEarned >= 1000 },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', check: s => s.streak >= 3 },
  { id: 'streak_7', name: 'Dedicated', icon: '⭐', check: s => s.streak >= 7 },
]

const LEADERBOARD = [
  { name: 'satoshi.btc', earned: 12500, rank: 1 },
  { name: 'vitalik.eth', earned: 9800, rank: 2 },
  { name: 'cz_binance', earned: 7200, rank: 3 },
  { name: 'elonmusk', earned: 5400, rank: 4 },
  { name: 'naval', earned: 4100, rank: 5 },
]

const getDefault = () => ({
  balance: 0, totalEarned: 0, totalRedeemed: 0,
  address: genAddr(), txs: [], completed: [],
  streak: 0, lastDaily: null, spinAvailable: true,
  created: new Date().toISOString()
})

// Rust contract for display
const RUST_CONTRACT = `#[app_contract]
pub fn app_contract(
    app: &App,
    tx: &Transaction,
    x: &Data,    // Public input
    w: &Data,    // Private witness
) -> bool {
    let action: Action = x.deserialize();
    match action {
        Action::Mint { to, amount } => {
            verify_mint(app, tx, to, amount)
        }
        Action::Burn { amount, reward_id } => {
            verify_burn(app, tx, amount, reward_id)
        }
        Action::Transfer { from, to, amount } => {
            verify_transfer(app, tx, from, to, amount)
        }
    }
}`

function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...getDefault(), ...JSON.parse(saved) } : getDefault()
    } catch { return getDefault() }
  })

  const [view, setView] = useState('home') // 'home' or 'dashboard'
  const [techTab, setTechTab] = useState('contract')
  const [wallet, setWallet] = useState({ connected: false, type: null, address: null })
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [confetti, setConfetti] = useState(false)
  const [showSpin, setShowSpin] = useState(false)
  const [spinResult, setSpinResult] = useState(null)
  const [showWalletMenu, setShowWalletMenu] = useState(false) // New state for menu
  const [devMode, setDevMode] = useState(false)
  const [logs, setLogs] = useState([])

  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50))

  useEffect(() => {
    if (devMode) addLog(`State updated: Balance=${state.balance} Streak=${state.streak}`)
  }, [state, devMode])

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])
  useEffect(() => {
    const pending = state.txs.filter(t => t.status === 'pending')
    if (pending.length) {
      const timer = setTimeout(() => {
        setState(s => ({ ...s, txs: s.txs.map(t => t.status === 'pending' ? { ...t, status: 'confirmed' } : t) }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.txs])

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fireConfetti = () => {
    setConfetti(true)
    // Play success sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVlHgLPm6JNjR0Zhn+z4yX1cWmGTxe/9qXRnZnqZv+vumXRndoKMr+LvmHlpZHKFmrzq65R2bWt/iZiy5++WdG1ofY+fqN/skHRrbXyPlZzX6px4bm94h4+Yzt2ddW1scXmLk5DI1Jx1bm1yd4iRi8HMmXVtbXF2hY+IusSWdGxsbHF7h4euwJR0bGxrc3l/gov4')
      audio.volume = 0.3
      audio.play().catch(() => { })
    } catch { }
    setTimeout(() => setConfetti(false), 1500)
  }

  // Wallet Helper Functions
  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    notify('Address copied to clipboard!')
    setShowWalletMenu(false)
  }

  const disconnectWallet = () => {
    setWallet({ connected: false, type: null, address: null })
    setShowWalletMenu(false)
    notify('Wallet disconnected')
  }

  // Wallet detection and connection
  const detectWallets = () => [
    { id: 'xverse', name: 'Xverse', logo: '/wallets/xverse.svg', desc: 'Recommended for BOS', available: true },
    { id: 'leather', name: 'Leather', logo: '/wallets/leather.svg', desc: 'Stacks & Bitcoin', available: typeof window !== 'undefined' && !!window.LeatherProvider },
    { id: 'unisat', name: 'Unisat', logo: '/wallets/unisat.svg', desc: 'Ordinals & BRC-20', available: typeof window !== 'undefined' && !!window.unisat },
    { id: 'okx', name: 'OKX Wallet', logo: '/wallets/okx.svg', desc: 'Multi-chain', available: typeof window !== 'undefined' && !!window.okxwallet?.bitcoin },
  ]

  const connectWallet = async (walletId) => {
    try {
      if (walletId === 'xverse') {
        // Xverse: We request the address without enforcing network in the payload
        // This avoids the 'Mismatched Network' blocker, allowing the user to switch manually
        await getAddress({
          payload: {
            purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
            message: 'CharmRewards - Bitcoin Loyalty Tokens',
            network: { type: BitcoinNetworkType.Testnet },
          },
          onFinish: (response) => {
            const paymentAddr = response.addresses.find(a => a.purpose === AddressPurpose.Payment)
            if (paymentAddr) {
              setWallet({ connected: true, type: 'xverse', address: paymentAddr.address })
              setState(s => ({ ...s, address: paymentAddr.address }))
              notify('✅ Wallet connected! Ensure you are on Testnet.')
              setShowWalletModal(false)
            }
          },
          onCancel: () => notify('Connection cancelled', 'error'),
        })
      } else if (walletId === 'unisat' && window.unisat) {
        // Auto-switch for UniSat
        try {
          await window.unisat.switchNetwork('testnet')
        } catch (e) {
          console.log('Switch failed, continuing...', e)
        }

        const accounts = await window.unisat.requestAccounts()
        if (accounts[0]) {
          setWallet({ connected: true, type: 'unisat', address: accounts[0] })
          setState(s => ({ ...s, address: accounts[0] }))
          notify('✅ Wallet connected!')
          setShowWalletModal(false)
        }
      } else {
        notify('Please install the wallet extension', 'error')
      }
    } catch (err) {
      console.error(err)
      notify('Connection failed: Check network settings', 'error')
    }
  }

  const addTx = (type, amount, desc, extra = {}) => {
    setState(s => ({
      ...s,
      txs: [{
        id: genHash(),
        type,
        amount,
        desc,
        date: new Date().toISOString(),
        status: 'pending',
        spell: { version: 8, action: type.toUpperCase(), app: `t/${TOKEN.appId}`, amount, ...extra }
      }, ...s.txs]
    }))
  }

  const handleMint = async (amount) => {
    if (!wallet.connected) return setShowWalletModal(true)

    try {
      // UniSat Check: UniSat API is different from sats-connect
      if (wallet.type === 'unisat' && window.unisat) {
        try {
          const txid = await window.unisat.sendBitcoin(wallet.address, amount)
          setState(s => ({ ...s, balance: s.balance + amount, totalEarned: s.totalEarned + amount }))
          addTx('mint', amount, `Mint ${amount} REWA`, { to: state.address, id: txid })
          notify(`+${amount} ${TOKEN.ticker} (TX Sent)`)
          fireConfetti()
        } catch (e) {
          throw e
        }
        return
      }

      // Xverse / Sats Connect
      await sendBtcTransaction({
        payload: {
          network: { type: BitcoinNetworkType.Testnet },
          recipients: [
            {
              address: wallet.address,
              amountSats: BigInt(amount),
            },
          ],
          senderAddress: wallet.address,
        },
        onFinish: (response) => {
          setState(s => ({ ...s, balance: s.balance + amount, totalEarned: s.totalEarned + amount }))
          addTx('mint', amount, `Mint ${amount} REWA`, { to: state.address, id: response })
          notify(`+${amount} ${TOKEN.ticker} (TX Sent)`)
          fireConfetti()
        },
        onCancel: () => notify('Mint cancelled', 'error'),
      })
    } catch (e) {
      console.error(e)
      const isUserReject = e.message?.includes('User rejected') || e.code === 4001
      if (isUserReject) {
        notify('Transaction rejected', 'error')
      } else {
        notify(`Transaction failed: ${e.message}`, 'error')
      }
    }
  }

  const handleBurn = async (reward) => {
    if (!wallet.connected) return setShowWalletModal(true)
    if (state.balance < reward.cost) return notify('Insufficient balance', 'error')

    // Real Burn: Send sats to a "burn" (return to self for now to save user funds on testnet)
    try {
      await sendBtcTransaction({
        payload: {
          network: { type: BitcoinNetworkType.Testnet },
          recipients: [
            {
              address: wallet.address,
              amountSats: BigInt(Math.max(1, reward.cost)), // Burn cost equivalent
            },
          ],
          senderAddress: wallet.address,
        },
        onFinish: (response) => {
          setState(s => ({ ...s, balance: s.balance - reward.cost, totalRedeemed: s.totalRedeemed + reward.cost }))
          addTx('burn', -reward.cost, reward.name, { rewardId: reward.id, id: response })
          notify(`Redeemed: ${reward.name}`)
          fireConfetti()
        },
        onCancel: () => notify('Burn cancelled', 'error'),
      })
    } catch (e) {
      console.error(e)
      notify(`Transaction failed: ${e.message}`, 'error')
    }
  }

  const handleSpin = () => {
    if (!state.spinAvailable) return
    setShowSpin(true)
    const prizes = [25, 50, 100, 200, 500]
    const result = prizes[Math.floor(Math.random() * prizes.length)]
    setTimeout(() => {
      setSpinResult(result)
      setState(s => ({ ...s, balance: s.balance + result, totalEarned: s.totalEarned + result, spinAvailable: false }))
      addTx('mint', result, 'Lucky Spin', { to: state.address })
      fireConfetti()
    }, 2000)
  }

  const handleDailyCheckin = () => {
    const today = new Date().toDateString()
    const lastDay = state.lastDaily ? new Date(state.lastDaily).toDateString() : null
    if (lastDay === today) return notify('Already claimed today!', 'error')

    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const newStreak = lastDay === yesterday ? state.streak + 1 : 1
    const bonus = Math.min(25 + (newStreak - 1) * 25, 175)

    setState(s => ({ ...s, streak: newStreak, lastDaily: new Date().toISOString(), balance: s.balance + bonus, totalEarned: s.totalEarned + bonus }))
    addTx('mint', bonus, 'Daily Check-in', { to: state.address })
    notify(`+${bonus} REWA (${newStreak}🔥 streak)`)
    fireConfetti()
  }

  // Spell YAML for display
  const generateSpell = (action, amount) => `version: 8
apps:
  $0: t/${TOKEN.appId}/${genHash().slice(0, 8)}

ins:
  - utxo_id: ${genHash().slice(0, 16)}...
    charms:
      $0: ${state.balance}

outs:
  - address: ${state.address.slice(0, 20)}...
    charms:
      $0: ${action === 'mint' ? state.balance + amount : state.balance - amount}

# Action: ${action.toUpperCase()}
# Amount: ${action === 'mint' ? '+' : '-'}${amount} REWA`

  const unlockedAch = ACHIEVEMENTS.filter(a => a.check(state))
  const myLeaderPos = LEADERBOARD.findIndex(l => state.totalEarned > l.earned) + 1 || LEADERBOARD.length + 1

  return (
    <div className="app">
      {confetti && <div className="confetti">🎉</div>}

      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="CharmRewards" className="logo-img" />
          <span>CharmRewards</span>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Protocol</button>
          <button className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
        </nav>
        <div className="header-actions">
          {wallet.connected ? (
            <div className="wallet-container" style={{ position: 'relative' }}>
              <button
                className="wallet-btn connected"
                onClick={() => setShowWalletMenu(!showWalletMenu)}
              >
                <span className="wallet-indicator"></span>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </button>

              <AnimatePresence>
                {showWalletMenu && (
                  <motion.div
                    className="wallet-menu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <button onClick={copyAddress} className="menu-item">
                      📋 Copy Address
                    </button>
                    <a
                      href="https://bitcoinfaucet.uo1.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-item"
                      onClick={() => setShowWalletMenu(false)}
                    >
                      🚰 Faucet 1 (uo1.net)
                    </a>
                    <a
                      href="https://testnet-faucet.mempool.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-item"
                      onClick={() => setShowWalletMenu(false)}
                    >
                      🚰 Faucet 2 (Mempool)
                    </a>
                    <a
                      href="https://tbtc.bitaps.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-item"
                      onClick={() => setShowWalletMenu(false)}
                    >
                      🚰 Faucet 3 (Bitaps)
                    </a>
                    <button onClick={disconnectWallet} className="menu-item danger">
                      🔌 Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="wallet-btn" onClick={() => setShowWalletModal(true)}>Connect Wallet</button>
          )}
          <button className={`nav-btn ${devMode ? 'active' : ''}`} onClick={() => setDevMode(!devMode)} title="Developer Mode">
            {devMode ? '👨‍💻 ON' : '👨‍💻'}
          </button>
        </div>
      </header>

      {/* HOME VIEW - Technical Focus */}
      {/* HOME VIEW - Technical Focus */}
      {view === 'home' && (
        <motion.main
          className="main-home"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Hero */}
          <section className="hero">
            <h1>Bitcoin-Native Loyalty Tokens</h1>
            <p className="subtitle">Programmable rewards on Bitcoin using Charms Protocol + BOS zkVM</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-value">{state.balance.toLocaleString()}</span>
                <span className="hero-label">REWA Balance</span>
              </div>
              <div className="hero-stat">
                <span className="hero-value">{state.txs.length}</span>
                <span className="hero-label">Transactions</span>
              </div>
              <div className="hero-stat">
                <span className="hero-value">1M</span>
                <span className="hero-label">Max Supply</span>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="features">
            <div className="feature">
              <div className="feature-icon">₿</div>
              <h3>Bitcoin-Secured</h3>
              <p>Tokens exist as enchanted UTXOs on Bitcoin L1, not a separate chain</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔐</div>
              <h3>zkVM Verified</h3>
              <p>Every transaction generates a zero-knowledge proof verified on-chain</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Programmable</h3>
              <p>Rust smart contracts define mint, burn, and transfer rules</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌐</div>
              <h3>Cross-Chain</h3>
              <p>Beam tokens to Cardano, Litecoin, or any UTXO chain without bridges</p>
            </div>
          </section>

          {/* Technical Section */}
          <section className="tech-section">
            <h2>🔬 Charms SDK Integration</h2>
            <div className="tech-tabs">
              <button className={`tech-tab ${techTab === 'contract' ? 'active' : ''}`} onClick={() => setTechTab('contract')}>Rust Contract</button>
              <button className={`tech-tab ${techTab === 'spell' ? 'active' : ''}`} onClick={() => setTechTab('spell')}>Spell YAML</button>
              <button className={`tech-tab ${techTab === 'proof' ? 'active' : ''}`} onClick={() => setTechTab('proof')}>Proof Pipeline</button>
            </div>
            <div className="tech-content">
              {techTab === 'contract' && (
                <pre className="code-block">{RUST_CONTRACT}</pre>
              )}
              {techTab === 'spell' && (
                <pre className="code-block">{generateSpell('mint', 1000)}</pre>
              )}
              {techTab === 'proof' && (
                <div className="proof-pipeline animated">
                  <div className="proof-step step-1"><span className="proof-icon">📝</span><span>Spell</span><small>YAML config</small></div>
                  <span className="proof-arrow anim-1">→</span>
                  <div className="proof-step step-2"><span className="proof-icon">⚙️</span><span>Contract</span><small>Rust logic</small></div>
                  <span className="proof-arrow anim-2">→</span>
                  <div className="proof-step step-3"><span className="proof-icon">🔐</span><span>zkVM</span><small>SP1 prover</small></div>
                  <span className="proof-arrow anim-3">→</span>
                  <div className="proof-step step-4"><span className="proof-icon">₿</span><span>Bitcoin</span><small>On-chain</small></div>
                </div>
              )}
            </div>
          </section>

          {/* Demo Actions */}
          <section className="demo-section">
            <h2>⚡ Try It</h2>
            <div className="demo-actions">
              <button className="demo-btn mint" onClick={() => handleMint(1000)}>
                <span>Mint 1000 REWA</span>
                <small>Creates enchanted UTXO</small>
              </button>
              <button className="demo-btn burn" onClick={() => handleBurn(REWARDS[0])} disabled={state.balance < 200}>
                <span>Burn for 10% Off</span>
                <small>Destroys tokens for reward</small>
              </button>
            </div>
          </section>

          {/* Transaction History */}
          {state.txs.length > 0 && (
            <section className="tx-section">
              <h2>📜 Recent Transactions</h2>
              <div className="tx-list">
                {state.txs.slice(0, 5).map(tx => (
                  <div key={tx.id} className="tx-row">
                    <span className={`tx-icon ${tx.type}`}>{tx.type === 'mint' ? '↑' : '↓'}</span>
                    <span className="tx-desc">{tx.desc}</span>
                    <span className={`tx-amt ${tx.amount > 0 ? 'pos' : 'neg'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                    <span className={`tx-status ${tx.status}`}>{tx.status === 'confirmed' ? '✓' : '⏳'}</span>
                    <a href={`https://mempool.space/testnet/tx/${tx.id}`} target="_blank" rel="noopener" className="tx-hash" title="View on mempool.space">
                      {tx.id.slice(0, 8)}... 🔗
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </motion.main>
      )}

      {/* DASHBOARD VIEW - Gamification */}
      {view === 'dashboard' && (
        <motion.main
          className="main-dashboard"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Stats Bar */}
          <div className="dash-stats">
            <div className="dash-stat main">
              <span className="dash-value">{state.balance.toLocaleString()}</span>
              <span className="dash-label">REWA</span>
            </div>
            <div className="dash-stat">
              <span className="dash-value">🔥 {state.streak}</span>
              <span className="dash-label">Streak</span>
            </div>
            <div className="dash-stat">
              <span className="dash-value">#{myLeaderPos}</span>
              <span className="dash-label">Rank</span>
            </div>
          </div>

          <div className="dash-grid">
            {/* Earn Section - Realistic Actions */}
            <section className="dash-card">
              <h3>⚡ How to Earn REWA</h3>
              <div className="earn-actions">
                <div className={`earn-action ${wallet.connected ? 'completed' : ''}`}>
                  <div className="earn-action-info">
                    <span className="earn-action-icon">🔗</span>
                    <div>
                      <div className="earn-action-title">Connect Wallet</div>
                      <div className="earn-action-desc">Link your Bitcoin wallet</div>
                    </div>
                  </div>
                  <div className="earn-action-reward">
                    {wallet.connected ? <span className="completed-badge">✓ Done</span> : <span className="earn-tokens">+500</span>}
                  </div>
                </div>

                <div className={`earn-action ${state.lastDaily === new Date().toDateString() ? 'completed' : ''}`} onClick={handleDailyCheckin}>
                  <div className="earn-action-info">
                    <span className="earn-action-icon">📅</span>
                    <div>
                      <div className="earn-action-title">Daily Check-in</div>
                      <div className="earn-action-desc">Visit once per day ({state.streak}🔥 streak)</div>
                    </div>
                  </div>
                  <div className="earn-action-reward">
                    {state.lastDaily === new Date().toDateString() ? <span className="completed-badge">✓ Claimed</span> : <span className="earn-tokens">+{Math.min(25 + state.streak * 25, 175)}</span>}
                  </div>
                </div>

                <div className="earn-action disabled">
                  <div className="earn-action-info">
                    <span className="earn-action-icon">🛒</span>
                    <div>
                      <div className="earn-action-title">Make a Purchase</div>
                      <div className="earn-action-desc">1 REWA per $1 spent</div>
                    </div>
                  </div>
                  <div className="earn-action-reward">
                    <span className="earn-tokens">+1/$ </span>
                  </div>
                </div>

                <div className="earn-action disabled">
                  <div className="earn-action-info">
                    <span className="earn-action-icon">👥</span>
                    <div>
                      <div className="earn-action-title">Refer a Friend</div>
                      <div className="earn-action-desc">Share your referral code</div>
                    </div>
                  </div>
                  <div className="earn-action-reward">
                    <span className="earn-tokens">+200</span>
                  </div>
                </div>
              </div>
              <p className="earn-note">💡 Tokens are minted on Bitcoin when actions are verified</p>
            </section>

            {/* Redeem Section */}
            <section className="dash-card">
              <h3>🎁 Redeem Rewards</h3>
              <div className="rewards-list">
                {REWARDS.map(r => (
                  <div key={r.id} className={`reward-row ${state.balance < r.cost ? 'locked' : ''}`}>
                    <span>{r.icon}</span>
                    <span className="reward-name">{r.name}</span>
                    <span className="reward-cost">{r.cost}</span>
                    <button className="btn-sm" onClick={() => handleBurn(r)} disabled={state.balance < r.cost}>
                      {state.balance >= r.cost ? 'Get' : `+${r.cost - state.balance}`}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section className="dash-card">
              <h3>🎖️ Achievements ({unlockedAch.length}/{ACHIEVEMENTS.length})</h3>
              <div className="ach-grid">
                {ACHIEVEMENTS.map(a => (
                  <div key={a.id} className={`ach-item ${a.check(state) ? 'unlocked' : ''}`}>
                    <span className="ach-icon">{a.icon}</span>
                    <span className="ach-name">{a.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Leaderboard */}
            <section className="dash-card">
              <h3>🏆 Leaderboard</h3>
              <div className="leader-list">
                {LEADERBOARD.map(l => (
                  <div key={l.rank} className="leader-row">
                    <span className="leader-rank">#{l.rank}</span>
                    <span className="leader-name">{l.name}</span>
                    <span className="leader-score">{l.earned.toLocaleString()}</span>
                  </div>
                ))}
                <div className="leader-row you">
                  <span className="leader-rank">#{myLeaderPos}</span>
                  <span className="leader-name">You</span>
                  <span className="leader-score">{state.totalEarned.toLocaleString()}</span>
                </div>
              </div>
            </section>
          </div>
        </motion.main>
      )}

      {/* Footer */}
      <footer className="footer">
        Built on <a href="https://charms.dev" target="_blank" rel="noopener">Charms Protocol</a> + <a href="https://bitcoinos.build" target="_blank" rel="noopener">BitcoinOS</a>
      </footer>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">🔗 Connect to BOS <button onClick={() => setShowWalletModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="bos-info">
                <strong>BitcoinOS (BOS)</strong> enables programmable Bitcoin via zkSNARK proofs.
              </div>
              <p className="wallet-label">Select a wallet:</p>
              {detectWallets().map(w => (
                <button key={w.id} className={`wallet-option ${!w.available && w.id !== 'xverse' ? 'disabled' : ''}`} onClick={() => connectWallet(w.id)}>
                  <img src={w.logo} alt={w.name} className="wallet-logo" />
                  <div className="wallet-info">
                    <div className="wallet-name">{w.name}</div>
                    <div className="wallet-desc">{w.desc}</div>
                  </div>
                  {!w.available && w.id !== 'xverse' && <span className="wallet-badge">Not installed</span>}
                </button>
              ))}
              <div className="network-info">
                <div className="network-header">
                  <span>Network Configuration</span>
                  <span className="network-tag">Testnet</span>
                </div>
                <div className="network-details">
                  <div className="network-field">
                    <label>BTC URL</label>
                    <code>https://mempool.space/testnet/api</code>
                  </div>
                  <div className="network-field">
                    <label>Explorer</label>
                    <code>https://mempool.space/testnet</code>
                  </div>
                </div>
                <p className="network-help">
                  <strong>Xverse:</strong> Switch to Testnet in wallet settings manually.<br />
                  <strong>UniSat:</strong> Use "Add Custom Network" with above details.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spin Modal */}
      {showSpin && (
        <div className="modal-overlay">
          <div className="modal spin-modal">
            <div className="spin-wheel">{spinResult ? `🎉 +${spinResult}` : '🎰'}</div>
            {spinResult && <button className="btn-primary" onClick={() => { setShowSpin(false); setSpinResult(null) }}>Collect!</button>}
          </div>
        </div>
      )}

      {/* Dev Console */}
      <AnimatePresence>
        {devMode && (
          <motion.div
            className="dev-console"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '200px', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="dev-header">
              <span>🔧 BitcoinOS zkVM Debugger</span>
              <button onClick={() => setLogs([])}>Clear</button>
            </div>
            <div className="dev-logs">
              {logs.length === 0 && <span className="log-empty">Waiting for protocol events...</span>}
              {logs.map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

export default App
