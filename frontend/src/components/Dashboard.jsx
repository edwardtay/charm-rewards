import { useState } from 'react'
import './Dashboard.css'

function Dashboard({ balance, pending, totalEarned, totalRedeemed, recentTransactions, walletAddress, onTransfer }) {
    const [showTransfer, setShowTransfer] = useState(false)
    const [transferTo, setTransferTo] = useState('')
    const [transferAmount, setTransferAmount] = useState('')

    const handleTransfer = (e) => {
        e.preventDefault()
        if (!transferTo || !transferAmount) return
        onTransfer(transferTo, parseInt(transferAmount))
        setTransferTo('')
        setTransferAmount('')
        setShowTransfer(false)
    }

    // Calculate loyalty rank based on total earned
    const getLoyaltyRank = () => {
        if (totalEarned >= 5000) return { name: 'Diamond', color: '#b9f2ff' }
        if (totalEarned >= 2000) return { name: 'Platinum', color: '#e5e4e2' }
        if (totalEarned >= 1000) return { name: 'Gold', color: '#ffd700' }
        if (totalEarned >= 500) return { name: 'Silver', color: '#c0c0c0' }
        if (totalEarned >= 100) return { name: 'Bronze', color: '#cd7f32' }
        return { name: 'Starter', color: '#888' }
    }

    const rank = getLoyaltyRank()

    return (
        <div className="dashboard">
            {/* Hero Balance Card */}
            <div className="balance-hero card card-highlight">
                <div className="balance-header">
                    <span className="balance-label">Your Balance</span>
                    <span className="token-badge">REWA</span>
                </div>
                <div className="balance-amount">
                    <span className="balance-value">{balance.toLocaleString()}</span>
                    <span className="balance-token">tokens</span>
                </div>
                {pending > 0 && (
                    <div className="pending-badge">
                        <span className="pending-icon">⏳</span>
                        {pending} pending transaction{pending > 1 ? 's' : ''}
                    </div>
                )}
                <div className="balance-actions">
                    <button className="btn btn-primary" onClick={() => setShowTransfer(!showTransfer)}>
                        <span>↗</span> Send
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(walletAddress)}>
                        <span>📋</span> Copy Address
                    </button>
                </div>

                {/* Transfer Form */}
                {showTransfer && (
                    <form className="transfer-form" onSubmit={handleTransfer}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Recipient address (tb1p...)"
                            value={transferTo}
                            onChange={(e) => setTransferTo(e.target.value)}
                        />
                        <div className="transfer-amount-row">
                            <input
                                type="number"
                                className="input"
                                placeholder="Amount"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                min="1"
                                max={balance}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!transferTo || !transferAmount}>
                                Send
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon earned">⚡</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Earned</span>
                        <span className="stat-value">{totalEarned.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon redeemed">🎁</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Redeemed</span>
                        <span className="stat-value">{totalRedeemed.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon rank">🏆</div>
                    <div className="stat-info">
                        <span className="stat-label">Loyalty Rank</span>
                        <span className="stat-value rank-text" style={{ color: rank.color }}>{rank.name}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-cards">
                    <div className="action-card card" onClick={() => window.location.hash = '#earn'}>
                        <span className="action-icon">🛒</span>
                        <span className="action-title">Make a Purchase</span>
                        <span className="action-desc">Earn 1 REWA per $1 spent</span>
                    </div>
                    <div className="action-card card" onClick={() => window.location.hash = '#earn'}>
                        <span className="action-icon">👥</span>
                        <span className="action-title">Refer a Friend</span>
                        <span className="action-desc">Get 200 REWA bonus</span>
                    </div>
                    <div className="action-card card" onClick={() => window.location.hash = '#earn'}>
                        <span className="action-icon">📅</span>
                        <span className="action-title">Daily Check-in</span>
                        <span className="action-desc">Earn 25 REWA daily</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <div className="section-header">
                    <h3>Recent Activity</h3>
                    {recentTransactions.length > 0 && (
                        <span className="view-all" onClick={() => window.location.hash = '#history'}>View All →</span>
                    )}
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="activity-list">
                        {recentTransactions.map(tx => (
                            <div key={tx.id} className="activity-item card">
                                <div className={`activity-icon ${tx.type}`}>
                                    {tx.type === 'earn' && '⬆'}
                                    {tx.type === 'redeem' && '🔥'}
                                    {tx.type === 'transfer' && '↔'}
                                    {tx.type === 'mint' && '✨'}
                                </div>
                                <div className="activity-info">
                                    <span className="activity-desc">{tx.desc}</span>
                                    <span className="activity-date">
                                        {tx.date} ·
                                        <span className={`tx-status ${tx.status}`}>
                                            {tx.status === 'confirmed' ? ' ✓ Confirmed' : ' ⏳ Pending'}
                                        </span>
                                    </span>
                                </div>
                                <div className={`activity-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-activity card">
                        <span>No transactions yet. Start earning tokens! ⚡</span>
                    </div>
                )}
            </div>

            {/* Bitcoin Security Banner */}
            <div className="security-banner card">
                <div className="security-icon">₿</div>
                <div className="security-text">
                    <strong>Secured by Bitcoin</strong>
                    <span>Your rewards are programmable tokens verified by zkVM proofs</span>
                </div>
                <a href="https://charms.dev" target="_blank" rel="noopener" className="btn btn-ghost">
                    Learn More
                </a>
            </div>
        </div>
    )
}

export default Dashboard
