import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import { BRAND } from '../../config';

const FEED_SAMPLE = [
  'bronze-vessel.svg',
  'maratha-sword.svg',
  'stone-carv.svg',
  'urn-plate.svg',
  'idol.svg',
  'fort-arch.svg'
];

export default function InstagramSection() {
  return (
    <section className="insta section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="Follow the Journey"
          title="Raajwarasa on Instagram"
          subtitle="Daily glimpses into the collection, the heritage and the stories behind it."
        />

        <div className="insta__grid">
          {FEED_SAMPLE.map((img, i) => (
            <Reveal key={img} delay={i * 70} className="insta__tile">
              <a
                href="{BRAND.instagramUrl}"
                target="_blank"
                rel="noreferrer"
                className="insta__tile-link"
                aria-label="View Instagram post"
              >
                <img src={`/placeholders/${img}`} alt="Raajwarasa on Instagram" loading="lazy" className="insta__img" />
                <span className="insta__overlay" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="insta__cta">
          <a
            href="{BRAND.instagramUrl}"
            target="_blank"
            rel="noreferrer"
            className="btn btn--primary"
          >
            Follow us on Instagram
            <span className="btn-arrow">→</span>
          </a>
          <p className="insta__handle">@{BRAND.instagramHandle}</p>
        </Reveal>
      </div>
    </section>
  );
}