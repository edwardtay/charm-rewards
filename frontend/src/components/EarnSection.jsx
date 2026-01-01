import { useState } from 'react'
import './EarnSection.css'

const EARN_ACTIONS = [
    {
        id: 'welcome',
        icon: '👋',
        title: 'Welcome Bonus',
        description: 'One-time bonus for new users',
        tokens: 500,
        buttonText: 'Claim Bonus',
        color: 'orange',
        oneTime: true
    },
    {
        id: 'purchase',
        icon: '🛒',
        title: 'Make a Purchase',
        description: 'Earn rewards on every purchase you make',
        tokens: 100,
        buttonText: 'Simulate Purchase',
        color: 'green',
        oneTime: false
    },
    {
        id: 'referral',
        icon: '👥',
        title: 'Refer a Friend',
        description: 'Invite friends and earn bonus tokens',
        tokens: 200,
        buttonText: 'Share Referral Link',
        color: 'blue',
        oneTime: true
    },
    {
        id: 'social',
        icon: '🐦',
        title: 'Follow on X',
        description: 'Connect your X account for rewards',
        tokens: 50,
        buttonText: 'Connect X',
        color: 'sky',
        oneTime: true
    },
    {
        id: 'profile',
        icon: '✅',
        title: 'Complete Profile',
        description: 'Add your details to unlock bonus',
        tokens: 75,
        buttonText: 'Complete Now',
        color: 'purple',
        oneTime: true
    },
    {
        id: 'daily',
        icon: '📅',
        title: 'Daily Check-in',
        description: 'Visit daily to earn streak rewards',
        tokens: 25,
        buttonText: 'Check In',
        color: 'yellow',
        oneTime: false
    }
]

function EarnSection({ onEarn, completedActions = [] }) {
    const [processingId, setProcessingId] = useState(null)

    const handleEarn = async (action) => {
        // Check if one-time action already completed
        if (action.oneTime && completedActions.includes(action.id)) {
            return
        }

        setProcessingId(action.id)

        // Small delay to show processing state
        await new Promise(resolve => setTimeout(resolve, 500))

        onEarn(action.tokens, action.title, action.id)
        setProcessingId(null)
    }

    const isCompleted = (action) => action.oneTime && completedActions.includes(action.id)

    return (
        <div className="earn-section">
            <div className="earn-header">
                <h2>Earn REWA Tokens</h2>
                <p>Complete actions to earn rewards. Your tokens are secured on Bitcoin!</p>
            </div>

            <div className="multiplier-banner card">
                <div className="multiplier-icon">🔥</div>
                <div className="multiplier-text">
                    <strong>Data Persists!</strong>
                    <span>Your tokens are saved locally - refresh to verify</span>
                </div>
                <div className="multiplier-badge">💾</div>
            </div>

            <div className="earn-grid">
                {EARN_ACTIONS.map((action) => {
                    const completed = isCompleted(action)
                    const processing = processingId === action.id

                    return (
                        <div
                            key={action.id}
                            className={`earn-card card ${completed ? 'completed' : ''}`}
                        >
                            <div className="earn-card-header">
                                <span className={`earn-icon ${action.color}`}>{action.icon}</span>
                                <div className="token-reward">
                                    <span className="reward-value">+{action.tokens}</span>
                                    <span className="reward-label">REWA</span>
                                </div>
                            </div>

                            <h4 className="earn-title">{action.title}</h4>
                            <p className="earn-desc">{action.description}</p>

                            {action.oneTime && (
                                <span className="one-time-badge">One-time only</span>
                            )}

                            <button
                                className={`btn ${completed ? 'btn-completed' : 'btn-primary'} w-full`}
                                onClick={() => handleEarn(action)}
                                disabled={completed || processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Processing...
                                    </>
                                ) : completed ? (
                                    '✓ Completed'
                                ) : (
                                    action.buttonText
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* How it works */}
            <div className="how-it-works card">
                <h3>How Charms Tokens Work</h3>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <strong>Complete Actions</strong>
                            <span>Earn tokens by engaging with the platform</span>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <strong>Spell Created</strong>
                            <span>A Charms spell mints tokens to your UTXO</span>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <strong>Redeem Anytime</strong>
                            <span>Burn tokens to claim rewards - verified by zkVM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EarnSection
