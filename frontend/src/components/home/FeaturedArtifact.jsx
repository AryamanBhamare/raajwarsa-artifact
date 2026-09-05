import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import { useEnquiry } from '../../context/EnquiryContext';

export default function FeaturedArtifact({ artifact, loading }) {
  const { openEnquiry } = useEnquiry();

  if (loading) {
    return (
      <section className="featuredArt section-pad">
        <div className="container featuredArt__grid">
          <div className="featuredArt__media skeleton" />
          <div className="featuredArt__text">
            <div className="skeleton" style={{ height: 32, width: 160, marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 48, width: 300, marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 90, width: '100%' }} />
          </div>
        </div>
      </section>
    );
  }

  if (!artifact) return null;

  return (
    <section className="featuredArt section-pad">
      <div className="container featuredArt__grid">
        <Reveal className="featuredArt__media">
          <div className="featuredArt__frame">
            <img
              src={artifact.images?.[0]?.url || '/placeholders/idol.svg'}
              alt={artifact.name}
              loading="lazy"
              className="featuredArt__img"
            />
            <div className="featuredArt__frame-arc" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal delay={140} className="featuredArt__text">
          <span className="eyebrow eyebrow--left">Featured Artifact</span>
          <div className="formal-line formal-line--left" aria-hidden="true" />
          <span className="featuredArt__category">{artifact.category?.name}</span>
          <h2 className="featuredArt__title">{artifact.name}</h2>
          {artifact.description && (
            <p className="featuredArt__desc">{artifact.description}</p>
          )}
          <div className="featuredArt__meta">
            {artifact.period && (
              <div className="featuredArt__meta-item">
                <span className="featuredArt__meta-label">Period</span>
                <span className="featuredArt__meta-value">{artifact.period}</span>
              </div>
            )}
            {artifact.material && (
              <div className="featuredArt__meta-item">
                <span className="featuredArt__meta-label">Material</span>
                <span className="featuredArt__meta-value">{artifact.material}</span>
              </div>
            )}
            {artifact.origin && (
              <div className="featuredArt__meta-item">
                <span className="featuredArt__meta-label">Origin</span>
                <span className="featuredArt__meta-value">{artifact.origin}</span>
              </div>
            )}
          </div>
          <div className="featuredArt__actions">
            <Link to={`/collection/${artifact.slug}`} className="btn btn--primary">
              View Artifact
              <span className="btn-arrow">→</span>
            </Link>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => openEnquiry(artifact)}
            >
              Enquire
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}