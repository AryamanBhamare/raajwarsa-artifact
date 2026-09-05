import { useState } from 'react';
import { Link } from 'react-router-dom';
import { firstImage } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { formatINR } from '../config';

export default function ArtifactCard({ artifact, index = 0, delay = 0 }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const saleReady = artifact.saleAvailable && artifact.price;

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(artifact, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

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
        {saleReady && (
          <span className="artifact-card__price" aria-label={`Price ${formatINR(Number(artifact.price))}`}>
            {formatINR(Number(artifact.price))}
          </span>
        )}
        <span className="artifact-card__cta">
          {saleReady ? (added ? 'Added ✓' : 'Add to cart') : 'Discover'}
          {!saleReady && <span className="artifact-card__cta-arrow">→</span>}
        </span>
      </div>

      <div className="artifact-card__body">
        <div className="artifact-card__rule" />
        <h3 className="artifact-card__title">{artifact.name}</h3>
        {saleReady && (
          <button
            type="button"
            className={`artifact-card__quick ${added ? 'artifact-card__quick--added' : ''}`}
            onClick={quickAdd}
          >
            {added ? 'Added to cart ✓' : `Add to cart · ${formatINR(Number(artifact.price))}`}
          </button>
        )}
        {artifact.description ? (
          <p className="artifact-card__desc">{artifact.description.length > 120 ? artifact.description.slice(0, 118) + '…' : artifact.description}</p>
        ) : (
          <p className="artifact-card__desc artifact-card__desc--coming">Details coming soon.</p>
        )}
      </div>
    </Link>
  );
}