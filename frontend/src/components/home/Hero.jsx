import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ artifact }) {
  const [loaded, setLoaded] = useState(false);

  const heroImage =
    artifact?.images?.[0]?.url || '/placeholders/bronze-vessel.svg';

  return (
    <section className="hero" aria-label="Raajwarasa introduction">
      <div className="hero__bg">
        <img
          src={heroImage}
          alt=""
          className={`hero__img ${loaded ? 'hero__img--loaded' : ''}`}
          onLoad={() => setLoaded(true)}
        />
        <div className="hero__overlay" />
        <div className="hero__veil" />
      </div>

      <div className="hero__content container-wide">
        <div className="hero__eyebrow">
          <span className="hero__rule" />
          <span>राजवारसा · HERITAGE COLLECTION</span>
          <span className="hero__rule" />
        </div>

        <h1 className="hero__title">
          <span className="hero__title-main">RAAJWARASA</span>
          <span className="hero__line" aria-hidden="true">
            <svg viewBox="0 0 1200 20" preserveAspectRatio="none">
              <path d="M0 10 L580 10 L600 2 L620 10 L1200 10" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="hero__tagline">Preserving the Legacy.<br />Presenting the Heritage.</span>
        </h1>

        <p className="hero__support">
          Discover a curated world of Maharashtra's heritage, craftsmanship,
          historical objects and stories preserved across generations.
        </p>

        <div className="hero__actions">
          <Link to="/collection" className="btn btn--primary btn--lg">
            Explore the Collection
            <span className="btn-arrow">→</span>
          </Link>
          <Link to="/our-story" className="btn btn--outline btn--lg">
            Our Story
          </Link>
        </div>
      </div>

      <div className="hero__scroll">
        <span className="hero__scroll-text">EXPLORE THE HERITAGE</span>
        <span className="hero__scroll-line" />
        <span className="hero__scroll-arrow">↓</span>
      </div>
    </section>
  );
}