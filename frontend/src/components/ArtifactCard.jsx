import { Link } from 'react-router-dom';
import { firstImage } from '../lib/utils';

export default function ArtifactCard({ artifact, index = 0, delay = 0 }) {
  return (
    <Link
      to={`/collection/${artifact.slug}`}
      className="artifact-card"
      aria-label={`View ${artifact.name}`}
    >
      <div className="artifact-card__media">
        <img
          src={firstImage(artifact)}
          alt={artifact.images?.[0]?.altText || artifact.name}
          loading="lazy"
          decoding="async"
          className="artifact-card__img"
        />
        <div className="artifact-card__veil" />
        <span className="artifact-card__category">{artifact.category?.name}</span>
        <span className="artifact-card__index">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <span className="artifact-card__cta">
          Discover
          <span className="artifact-card__cta-arrow">→</span>
        </span>
      </div>

      <div className="artifact-card__body">
        <div className="artifact-card__rule" />
        <h3 className="artifact-card__title">{artifact.name}</h3>
        {artifact.description ? (
          <p className="artifact-card__desc">{artifact.description.length > 120 ? artifact.description.slice(0, 118) + '…' : artifact.description}</p>
        ) : (
          <p className="artifact-card__desc artifact-card__desc--coming">Details coming soon.</p>
        )}
      </div>
    </Link>
  );
}