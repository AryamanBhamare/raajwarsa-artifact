import { Link } from 'react-router-dom';
import Reveal from '../Reveal';

export default function Introduction() {
  return (
    <section className="intro section-pad">
      <div className="container intro__grid">
        <Reveal className="intro__media">
          <div className="intro__image-wrap">
            <img
              src="/placeholders/fort-arch.svg"
              alt="A fort remnant — Maharashtra's architectural heritage"
              className="intro__image"
              loading="lazy"
            />
            <div className="intro__image-border" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal delay={120} className="intro__text">
          <span className="eyebrow eyebrow--left">THE HOUSE OF RAAJWARASA</span>
          <span className="formal-line formal-line--left" aria-hidden="true" />
          <h2 className="intro__title">Where History Becomes Tangible</h2>
          <p className="intro__body">
            Raajwarasa is a heritage-focused collection dedicated to preserving and
            presenting objects, craftsmanship and stories connected with Maharashtra's
            rich cultural legacy.
          </p>
          <p className="intro__body intro__body--muted">
            Every piece we present is treated with the care it deserves — documented,
            preserved and shared with a modern audience that values the past.
          </p>
          <Link to="/our-story" className="btn btn--ghost intro__cta">
            Explore our story
            <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}