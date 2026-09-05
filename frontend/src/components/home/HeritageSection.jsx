import { Link } from 'react-router-dom';
import Reveal from '../Reveal';

const LEGACY_PILLARS = [
  {
    title: 'Sahyadri',
    text: 'The mountain ranges that shaped the landscape and spirit of the region.'
  },
  {
    title: 'The Forts',
    text: 'Stone citadels that carried the region through centuries of history.'
  },
  {
    title: 'Craftsmanship',
    text: 'The hands of artisans who turned material into memory.'
  }
];

export default function HeritageSection() {
  return (
    <section className="heritage section-pad">
      <div className="heritage__bg" aria-hidden="true">
        <div className="heritage__bg-img">
          <img src="/placeholders/fort-arch.svg" alt="" loading="lazy" />
        </div>
        <div className="heritage__bg-veil" />
      </div>

      <div className="container heritage__content">
        <Reveal className="heritage__head">
          <span className="eyebrow">The Land of Heritage</span>
          <h2 className="heritage__title">Maharashtra's legacy,<br />kept alive</h2>
          <p className="heritage__subtitle">
            From the Sahyadris to the forts, traditions and craftsmanship that shaped
            generations, Maharashtra carries a legacy that deserves to be remembered.
          </p>
        </Reveal>

        <div className="heritage__pillars">
          {LEGACY_PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 140} className="heritage__pillar">
              <span className="heritage__pillar-index">0{i + 1}</span>
              <h3 className="heritage__pillar-title">{pillar.title}</h3>
              <p className="heritage__pillar-text">{pillar.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="heritage__cta">
          <Link to="/heritage" className="btn btn--outline">
            Discover the heritage
            <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}