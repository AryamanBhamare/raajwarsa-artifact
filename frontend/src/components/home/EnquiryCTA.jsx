import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import { useEnquiry } from '../../context/EnquiryContext';

export default function EnquiryCTA() {
  const { openEnquiry } = useEnquiry();

  return (
    <section className="cta section-pad">
      <div className="cta__bg" aria-hidden="true">
        <img src="/placeholders/urn-plate.svg" alt="" loading="lazy" />
        <div className="cta__veil" />
      </div>

      <div className="container cta__content">
        <Reveal className="cta__inner">
          <span className="eyebrow">Begin the conversation</span>
          <h2 className="cta__title">
            Interested in a piece from<br />
            <em>the collection?</em>
          </h2>
          <p className="cta__text">
            Every artifact has a story and a journey. Tell us what drew your eye and
            we will guide you through availability, provenance and care.
          </p>
          <div className="cta__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => openEnquiry(null)}>
              Enquire now
              <span className="btn-arrow">→</span>
            </button>
            <Link to="/collection" className="btn btn--outline btn--lg">
              Explore the collection
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}