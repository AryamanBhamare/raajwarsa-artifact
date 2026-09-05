import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';
import { useCart } from '../context/CartContext';
import { BRAND, whatsappUrl } from '../config';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Collection', to: '/collection' },
  { label: 'Heritage', to: '/heritage' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Journal', to: '/journal' },
  { label: 'Enquire', to: '/enquire' },
  { label: 'Contact', to: '/contact' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className={`nav__bar ${!isHome || scrolled ? 'nav__bar--solid' : ''}`}>
          <div className="container-wide nav__inner">
            <Link to="/" className="nav__logo" aria-label="Raajwarasa home">
              <span className="nav__logo-mark">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
                  <path d="M32 20 L35 29.5 L44.5 32.5 L35 35.5 L32 45 L29 35.5 L19.5 32.5 L29 29.5 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="nav__word">
                <span className="nav__word-main">RAAJWARASA</span>
                <span className="nav__word-sub">PRESERVING THE HERITAGE</span>
              </span>
            </Link>

            <nav className="nav__links" aria-label="Primary">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="nav__actions">
              <button
                type="button"
                className="nav__icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search the archive"
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
              </button>
<a
                className="nav__icon-btn nav__icon-btn--insta"
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Raajwarasa on Instagram"
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <Link to="/cart" className="nav__icon-btn nav__icon-btn--cart" aria-label={`Cart with ${count} items`}>
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9.5" cy="20" r="1.4" />
                  <circle cx="17" cy="20" r="1.4" />
                  <path d="M2.5 3.5h2.6l2.5 11.5h10.6l2-7.5H6.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {count > 0 && <span className="nav__cart-badge">{count}</span>}
              </Link>
              <button
                type="button"
                className={`nav__hamburger ${mobileOpen ? 'nav__hamburger--open' : ''}`}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        {/* ---- Mobile drawer ---- */}
        <div className={`drawer ${mobileOpen ? 'drawer--open' : ''}`} aria-hidden={!mobileOpen}>
          <div className="drawer__backdrop" onClick={() => setMobileOpen(false)} />
          <div className="drawer__panel">
            <button
              type="button"
              className="drawer__close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
              </svg>
            </button>
            <div className="drawer__brand">
              <span className="drawer__brand-mark" />
              <span>RAAJWARASA</span>
            </div>
            <nav className="drawer__nav" aria-label="Mobile">
              {NAV_ITEMS.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `drawer__link ${isActive ? 'drawer__link--active' : ''}`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <span className="drawer__link-num">0{i + 1}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="drawer__foot">
              <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer">
                @{BRAND.instagramHandle}
              </a>
              <a href={whatsappUrl()} target="_blank" rel="noreferrer">
                WhatsApp us
              </a>
              <Link to="/cart">Your cart ({count})</Link>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} />
    </>
  );
}