import { useState } from 'react'
import './AdminPanel.css'

function AdminPanel({ onMint, totalMinted = 0, maxSupply = 1000000, tokenConfig }) {
    const [recipientAddress, setRecipientAddress] = useState('')
    const [mintAmount, setMintAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Calculate live stats
    const remaining = maxSupply - totalMinted
    const percentUsed = ((totalMinted / maxSupply) * 100).toFixed(1)

    const handleMint = async (e) => {
        e.preventDefault()
        if (!recipientAddress || !mintAmount) return

        const amount = parseInt(mintAmount)
        if (isNaN(amount) || amount <= 0) return
        if (amount > remaining) return

        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 800))

        onMint(recipientAddress, amount)
        setRecipientAddress('')
        setMintAmount('')
        setIsLoading(false)
    }

    // Generate spell preview
    const spellPreview = `version: 8
apps:
  $0000: n/${tokenConfig?.appId || 'demo'}/\${app_vk}  # NFT (mint authority)
  $0001: t/${tokenConfig?.appId || 'demo'}/\${app_vk}  # REWA token

ins:
  - utxo_id: \${merchant_utxo}
    charms:
      $0000:
        ticker: ${tokenConfig?.ticker || 'REWA'}
        remaining: ${remaining}
        max_supply: ${maxSupply}

outs:
  - address: \${merchant_addr}
    charms:
      $0000:
        ticker: ${tokenConfig?.ticker || 'REWA'}
        remaining: ${remaining - (parseInt(mintAmount) || 0)}
        max_supply: ${maxSupply}
  - address: ${recipientAddress || '<recipient_addr>'}
    charms:
      $0001: ${mintAmount || '<amount>'}`

    return (
        <div className="admin-section">
            <div className="admin-header">
                <h2>🔧 Admin Panel</h2>
                <p>Merchant controls for token issuance and management</p>
            </div>

            {/* Token Stats */}
            <div className="admin-stats card">
                <h4>Live Token Statistics</h4>
                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-num">{maxSupply.toLocaleString()}</span>
                        <span className="stat-name">Max Supply</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num text-success">{totalMinted.toLocaleString()}</span>
                        <span className="stat-name">Total Minted</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num text-primary">{remaining.toLocaleString()}</span>
                        <span className="stat-name">Remaining</span>
                    </div>
                </div>

                {/* Supply Bar */}
                <div className="supply-bar">
                    <div className="supply-label">
                        <span>Supply Used</span>
                        <span>{percentUsed}%</span>
                    </div>
                    <div className="supply-track">
                        <div
                            className="supply-fill"
                            style={{ width: `${Math.min(parseFloat(percentUsed), 100)}%` }}
                        />
                    </div>
                    <div className="supply-remaining">
                        {remaining.toLocaleString()} tokens available to mint
                    </div>
                </div>
            </div>

            {/* Mint Form */}
            <div className="mint-section card">
                <h4>Mint Tokens</h4>
                <p className="mint-desc">
                    Issue new REWA tokens to a Bitcoin address. This creates a Charms spell
                    that adds tokens to the recipient's UTXO.
                </p>

                <form onSubmit={handleMint} className="mint-form">
                    <div className="form-group">
                        <label>Recipient Address</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="tb1p... (Bitcoin testnet address)"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount (REWA)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="Enter amount to mint"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                            min="1"
                            max={remaining}
                        />
                        {mintAmount && parseInt(mintAmount) > remaining && (
                            <span className="form-error">Exceeds remaining supply!</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary btn-lg w-full ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading || !recipientAddress || !mintAmount || parseInt(mintAmount) > remaining}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Spell...
                            </>
                        ) : (
                            <>
                                ✨ Mint Tokens
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Spell Preview */}
            <div className="spell-preview card">
                <h4>Generated Spell (Live Preview)</h4>
                <pre className="spell-code">{spellPreview}</pre>
                <p className="spell-note">
                    ℹ️ This YAML spell would be submitted to the Charms network to execute the mint operation.
                </p>
            </div>

            {/* Warning */}
            <div className="admin-warning">
                <span className="warning-icon">⚠️</span>
                <span>
                    In production, admin actions create real Bitcoin transactions requiring
                    signature and fees. This demo uses local storage to persist state.
                </span>
            </div>
        </div>
    )
}

export default AdminPanel
