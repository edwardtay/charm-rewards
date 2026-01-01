import { useState } from 'react'
import './RedeemSection.css'

function RedeemSection({ rewards, balance, onRedeem }) {
    const [selectedReward, setSelectedReward] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const handleRedeemClick = (reward) => {
        if (balance < reward.cost || !reward.available) return
        setSelectedReward(reward)
        setShowModal(true)
    }

    const confirmRedeem = () => {
        if (selectedReward) {
            onRedeem(selectedReward)
            setShowModal(false)
            setSelectedReward(null)
        }
    }

    return (
        <div className="redeem-section">
            <div className="redeem-header">
                <h2>Redeem Rewards</h2>
                <p>Burn your REWA tokens to claim exclusive rewards</p>
                <div className="balance-pill">
                    <span className="pill-label">Your Balance:</span>
                    <span className="pill-value">{balance.toLocaleString()} REWA</span>
                </div>
            </div>

            <div className="rewards-grid">
                {rewards.map((reward) => {
                    const canAfford = balance >= reward.cost
                    const isLocked = !reward.available

                    return (
                        <div
                            key={reward.id}
                            className={`reward-card card ${!canAfford ? 'unaffordable' : ''} ${isLocked ? 'locked' : ''}`}
                        >
                            {isLocked && <div className="locked-badge">Coming Soon</div>}

                            <div className="reward-icon">{reward.icon}</div>
                            <h4 className="reward-name">{reward.name}</h4>

                            <div className="reward-cost">
                                <span className="cost-value">{reward.cost.toLocaleString()}</span>
                                <span className="cost-label">REWA</span>
                            </div>

                            {!canAfford && !isLocked && (
                                <div className="need-more">
                                    Need {(reward.cost - balance).toLocaleString()} more
                                </div>
                            )}

                            <button
                                className={`btn w-full ${canAfford && !isLocked ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleRedeemClick(reward)}
                                disabled={!canAfford || isLocked}
                            >
                                {isLocked ? '🔒 Locked' : canAfford ? 'Redeem' : 'Insufficient'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Redemption Info */}
            <div className="redeem-info card">
                <h4>How Redemption Works</h4>
                <ul>
                    <li>
                        <span className="info-icon">🔥</span>
                        <span>Tokens are <strong>burned</strong> when you redeem - they're permanently removed from supply</span>
                    </li>
                    <li>
                        <span className="info-icon">✅</span>
                        <span>Redemption is verified by <strong>zero-knowledge proofs</strong> on Bitcoin</span>
                    </li>
                    <li>
                        <span className="info-icon">📜</span>
                        <span>Every redemption creates an <strong>on-chain record</strong> as proof of claim</span>
                    </li>
                </ul>
            </div>

            {/* Confirmation Modal */}
            {showModal && selectedReward && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Redemption</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-reward">
                                <span className="modal-icon">{selectedReward.icon}</span>
                                <span className="modal-name">{selectedReward.name}</span>
                            </div>

                            <div className="modal-summary">
                                <div className="summary-row">
                                    <span>Cost</span>
                                    <span className="cost-highlight">-{selectedReward.cost} REWA</span>
                                </div>
                                <div className="summary-row">
                                    <span>After Redemption</span>
                                    <span>{(balance - selectedReward.cost).toLocaleString()} REWA</span>
                                </div>
                            </div>

                            <div className="modal-warning">
                                ⚠️ This action is irreversible. Tokens will be burned.
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={confirmRedeem}>
                                Burn & Redeem
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RedeemSection
