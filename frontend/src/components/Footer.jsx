import './Footer.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-main">
                    <div className="footer-brand">
                        <span className="footer-logo">✨ CharmRewards</span>
                        <span className="footer-tagline">Bitcoin-Native Loyalty Tokens</span>
                    </div>

                    <div className="footer-links">
                        <a href="https://docs.charms.dev" target="_blank" rel="noopener">
                            Documentation
                        </a>
                        <a href="https://github.com/CharmsDev/charms" target="_blank" rel="noopener">
                            GitHub
                        </a>
                        <a href="https://charms.dev" target="_blank" rel="noopener">
                            Charms Protocol
                        </a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span className="footer-tech">
                        Built with <span className="heart">♥</span> using
                        <a href="https://charms.dev" target="_blank" rel="noopener"> Charms SDK</a> +
                        <a href="https://bitcoin.org" target="_blank" rel="noopener"> Bitcoin</a>
                    </span>
                    <span className="footer-copy">
                        Hackathon Demo © 2024
                    </span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
