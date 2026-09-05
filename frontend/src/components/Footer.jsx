import { Link } from 'react-router-dom';
import { BRAND, whatsappUrl } from '../config';

export default function Footer() {

  return (
    <footer className="footer">
      <div className="footer__arch" aria-hidden="true">
        <div className="arch-divider">
          <svg viewBox="0 0 220 30" preserveAspectRatio="none">
            <path
              d="M10 28 C10 10 60 4 110 4 C160 4 210 10 210 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M30 22 C30 12 70 9 110 9 C150 9 190 12 190 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      <div className="container footer__main">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__word">
              <span className="footer__logo-mark" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
                  <path d="M32 20 L35 29.5 L44.5 32.5 L35 35.5 L32 45 L29 35.5 L19.5 32.5 L29 29.5 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="footer__brand-word">RAAJWARASA</span>
            </Link>
            <p className="footer__tagline">Preserving heritage. Presenting history.</p>
            <p className="footer__blurb">
              A curated collection dedicated to preserving and presenting Maharashtra's objects, craftsmanship and stories.
            </p>
            <div className="footer__social">
              <a
                href="{BRAND.instagramUrl}"
                target="_blank"
                rel="noreferrer"
                className="footer__social-btn"
                aria-label="Raajwarasa on Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                </svg>
                <span>@{BRAND.instagramHandle}</span>
              </a>
            </div>
          </div>

          <nav className="footer__col" aria-label="Explore">
            <h4 className="footer__col-title">EXPLORE</h4>
            <Link to="/collection">The Collection</Link>
            <Link to="/heritage">Heritage of Maharashtra</Link>
            <Link to="/our-story">Our Story</Link>
            <Link to="/journal">Heritage Journal</Link>
          </nav>

          <nav className="footer__col" aria-label="Connect">
            <h4 className="footer__col-title">CONNECT</h4>
            <Link to="/enquire">Enquire</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/cart">Your cart</Link>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">
              WhatsApp ({BRAND.phoneDisplay})
            </a>
            <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </nav>

          <div className="footer__col">
            <h4 className="footer__col-title">A NOTE</h4>
            <p className="footer__note">
              History is not only something we read about. It is something we can preserve, experience and pass forward.
            </p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span className="footer__legal">© {new Date().getFullYear()} Raajwarasa. All rights reserved.</span>
          <div className="footer__legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>

      <div className="footer__dev" aria-hidden="true">राजवारसा</div>
    </footer>
  );
}