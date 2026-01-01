import { useState } from 'react'
import './TransactionHistory.css'

function TransactionHistory({ transactions, walletAddress }) {
    const [filter, setFilter] = useState('all')
    const [expandedTx, setExpandedTx] = useState(null)

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'earn': return '⬆'
            case 'redeem': return '🔥'
            case 'transfer': return '↔'
            case 'mint': return '✨'
            default: return '•'
        }
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'earn': return 'Earned'
            case 'redeem': return 'Burned'
            case 'transfer': return 'Transfer'
            case 'mint': return 'Minted'
            default: return type
        }
    }

    const filteredTxs = filter === 'all'
        ? transactions
        : transactions.filter(tx => tx.type === filter)

    return (
        <div className="history-section">
            <div className="history-header">
                <h2>Transaction History</h2>
                <p>All your REWA token activity - {transactions.length} total transactions</p>
            </div>

            <div className="history-filters">
                {['all', 'earn', 'redeem', 'transfer', 'mint'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : getTypeLabel(f)}
                    </button>
                ))}
            </div>

            <div className="history-list">
                {filteredTxs.map((tx) => (
                    <div key={tx.id} className="history-item-wrapper">
                        <div
                            className={`history-item card ${expandedTx === tx.id ? 'expanded' : ''}`}
                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                        >
                            <div className={`history-icon ${tx.type}`}>
                                {getTypeIcon(tx.type)}
                            </div>

                            <div className="history-details">
                                <div className="history-main">
                                    <span className="history-desc">{tx.desc}</span>
                                    <span className={`history-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} REWA
                                    </span>
                                </div>
                                <div className="history-meta">
                                    <span className={`history-type ${tx.type}`}>{getTypeLabel(tx.type)}</span>
                                    <span className="history-date">{formatDate(tx.date)}</span>
                                    <span className={`history-status ${tx.status}`}>
                                        {tx.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                    </span>
                                </div>
                            </div>

                            <button className="history-expand" title="View Details">
                                {expandedTx === tx.id ? '▲' : '▼'}
                            </button>
                        </div>

                        {/* Expanded Details */}
                        {expandedTx === tx.id && (
                            <div className="tx-details card">
                                <div className="tx-detail-row">
                                    <span className="tx-detail-label">Transaction ID</span>
                                    <span className="tx-detail-value mono">{tx.txHash || tx.id}</span>
                                </div>
                                {tx.timestamp && (
                                    <div className="tx-detail-row">
                                        <span className="tx-detail-label">Timestamp</span>
                                        <span className="tx-detail-value">{new Date(tx.timestamp).toLocaleString()}</span>
                                    </div>
                                )}
                                {tx.recipient && (
                                    <div className="tx-detail-row">
                                        <span className="tx-detail-label">Recipient</span>
                                        <span className="tx-detail-value mono">{tx.recipient}</span>
                                    </div>
                                )}
                                {tx.spell && (
                                    <div className="tx-detail-row">
                                        <span className="tx-detail-label">Charm Spell</span>
                                        <pre className="tx-spell-preview">{JSON.stringify(tx.spell, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredTxs.length === 0 && (
                <div className="empty-state card">
                    <span className="empty-icon">📜</span>
                    <span className="empty-text">
                        {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
                    </span>
                    <span className="empty-hint">
                        {filter === 'all' ? 'Start earning tokens to see your history' : 'Try a different filter'}
                    </span>
                </div>
            )}

            {/* Transaction Info */}
            <div className="tx-info card">
                <div className="tx-info-item">
                    <span className="tx-info-icon">🔗</span>
                    <div className="tx-info-content">
                        <strong>On-Chain Verification</strong>
                        <span>Each transaction creates a Charms spell on Bitcoin</span>
                    </div>
                </div>
                <div className="tx-info-item">
                    <span className="tx-info-icon">🔐</span>
                    <div className="tx-info-content">
                        <strong>ZK-Proof Secured</strong>
                        <span>All state transitions verified by zero-knowledge proofs</span>
                    </div>
                </div>
            </div>

            {/* Your Address */}
            <div className="your-address card">
                <span className="address-label">Your Wallet Address</span>
                <code className="address-value">{walletAddress}</code>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigator.clipboard.writeText(walletAddress)}
                >
                    Copy
                </button>
            </div>
        </div>
    )
}

export default TransactionHistory
