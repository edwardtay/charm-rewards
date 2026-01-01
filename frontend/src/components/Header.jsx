import './Header.css'

function Header({ walletAddress, isAdmin, onToggleAdmin, onReset }) {
    const copyAddress = () => {
        navigator.clipboard.writeText(walletAddress)
        // Show a brief tooltip or just let the user know somehow
        const btn = document.querySelector('.wallet-badge')
        if (btn) {
            btn.classList.add('copied')
            setTimeout(() => btn.classList.remove('copied'), 1500)
        }
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo">
                        <span className="logo-icon">✨</span>
                        <span className="logo-text">CharmRewards</span>
                    </div>
                    <div className="powered-by">
                        powered by <a href="https://charms.dev" target="_blank" rel="noopener">Charms</a> on Bitcoin
                    </div>
                </div>

                <div className="header-right">
                    <button
                        className="reset-btn btn btn-ghost"
                        onClick={onReset}
                        title="Reset Account"
                    >
                        🔄
                    </button>

                    <button
                        className={`mode-toggle ${isAdmin ? 'admin-active' : ''}`}
                        onClick={onToggleAdmin}
                        title="Toggle Admin Mode"
                    >
                        {isAdmin ? '🔧 Admin' : '👤 User'}
                    </button>

                    <div className="wallet-badge" onClick={copyAddress} title="Click to copy">
                        <span className="wallet-icon">₿</span>
                        <span className="wallet-address">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </span>
                        <span className="wallet-status connected"></span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
