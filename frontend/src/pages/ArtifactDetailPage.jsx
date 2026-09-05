import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArtifact, fetchArtifacts } from '../lib/api';
import { useEnquiry } from '../context/EnquiryContext';
import ArtifactCard from '../components/ArtifactCard';
import Reveal from '../components/Reveal';
import { availabilityLabel, imagesOf, firstImage } from '../lib/utils';

export default function ArtifactDetailPage() {
  const { slug } = useParams();
  const { openEnquiry } = useEnquiry();
  const [artifact, setArtifact] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('story');
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchArtifact(slug)
      .then((data) => {
        if (cancelled) return;
        setArtifact(data);
        if (data.category?.slug) {
          fetchArtifacts({ category: data.category.slug, size: 3 }).then((r) => {
            if (!cancelled) {
              setRelated((r.items || []).filter((a) => a.slug !== data.slug).slice(0, 3));
            }
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError('The archive has no record of this artifact.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const gallery = useMemo(() => imagesOf(artifact), [artifact]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    const onKey = (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, gallery.length]);

  if (loading) {
    return (
      <div className="artifact-detail">
        <div className="container artifact-detail__skeleton">
          <div className="artifact-detail__skeleton-media skeleton" />
          <div className="artifact-detail__skeleton-info">
            <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 46, width: 320, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 90, width: '100%', marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 60, width: 260 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="artifact-detail">
        <div className="container artifact-detail__missing">
          <span className="artifact-detail__missing-mark">✦</span>
          <h1 className="artifact-detail__missing-title">THE ARCHIVE HAS NO RECORD OF THIS ARTIFACT.</h1>
          <p className="artifact-detail__missing-sub">It may have moved, or the archive is still being documented.</p>
          <Link to="/collection" className="btn btn--outline">Return to the collection</Link>
        </div>
      </div>
    );
  }

  const tabContent = [
    { key: 'story', label: 'The Story', content: artifact.description || artifact.historicalContext || 'Details coming soon.' },
    { key: 'context', label: 'Historical Context', content: artifact.historicalContext || artifact.description || 'Details coming soon.' },
    { key: 'craft', label: 'Craftsmanship', content: artifact.craftsmanship || 'Details coming soon.' },
    { key: 'details', label: 'Details', content: artifact.size || artifact.condition || 'Details coming soon.' },
    { key: 'preservation', label: 'Preservation', content: artifact.preservation || 'Details coming soon.' }
  ];

  return (
    <div className="artifact-detail">
      {/* ---- HEADER / GALLERY + INFO ---- */}
      <section className="artifact-detail__top">
        <div className="container artifact-detail__grid">
          <div className="artifact-gallery">
            <div className="artifact-gallery__main">
              <button
                type="button"
                className="artifact-gallery__main-btn"
                onClick={() => {
                  setLightboxIndex(0);
                  setLightbox(true);
                }}
                aria-label="Open fullscreen image"
              >
                <img src={gallery[0]} alt={artifact.name} decoding="async" />
                <span className="artifact-gallery__expand" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
            {gallery.length > 1 && (
              <div className="artifact-gallery__thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`artifact-gallery__thumb ${i === 0 ? 'artifact-gallery__thumb--active' : ''}`}
                    onClick={() => {
                      document.querySelector('.artifact-gallery__main img').src = img;
                      setLightboxIndex(i);
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="artifact-info">
            <div className="artifact-info__crumbs">
              <Link to="/collection">Collection</Link>
              <span aria-hidden="true">/</span>
              <span>{artifact.category?.name}</span>
            </div>
            <h1 className="artifact-info__title">{artifact.name}</h1>

            <div className="artifact-info__specs">
              {artifact.category?.name && (
                <div className="artifact-info__spec">
                  <span className="artifact-info__spec-label">Category</span>
                  <span className="artifact-info__spec-value">{artifact.category.name}</span>
                </div>
              )}
              {artifact.period && (
                <div className="artifact-info__spec">
                  <span className="artifact-info__spec-label">Period</span>
                  <span className="artifact-info__spec-value">{artifact.period}</span>
                </div>
              )}
              {artifact.material && (
                <div className="artifact-info__spec">
                  <span className="artifact-info__spec-label">Material</span>
                  <span className="artifact-info__spec-value">{artifact.material}</span>
                </div>
              )}
              {artifact.origin && (
                <div className="artifact-info__spec">
                  <span className="artifact-info__spec-label">Origin</span>
                  <span className="artifact-info__spec-value">{artifact.origin}</span>
                </div>
              )}
              <div className="artifact-info__spec">
                <span className="artifact-info__spec-label">Availability</span>
                <span className="artifact-info__spec-value artifact-info__spec-value--avail">
                  {availabilityLabel(artifact.availability)}
                </span>
              </div>
            </div>

            {artifact.description && (
              <p className="artifact-info__lead">{artifact.description}</p>
            )}

            <button
              type="button"
              className="btn btn--primary btn--lg artifact-info__enquire"
              onClick={() => openEnquiry(artifact)}
            >
              Enquire about this artifact
              <span className="btn-arrow">→</span>
            </button>
            <p className="artifact-info__hint">
              Availability, pricing and provenance are discussed personally on enquiry.
            </p>
          </div>
        </div>
      </section>

      {/* ---- STORY / TABS ---- */}
      <section className="artifact-detail__story">
        <div className="container">
          <div className="artifact-story__head">
            <span className="eyebrow eyebrow--center">Behind the object</span>
            <h2 className="artifact-story__title">The Story Behind the Object</h2>
          </div>

          <div className="artifact-tabs">
            <div className="artifact-tabs__nav" role="tablist" aria-label="Artifact details">
              {tabContent.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  className={`artifact-tabs__tab ${activeTab === tab.key ? 'artifact-tabs__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="artifact-tabs__panel" role="tabpanel">
              <p className="artifact-tabs__text">{tabContent.find((t) => t.key === activeTab)?.content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- RELATED ---- */}
      {related.length > 0 && (
        <section className="artifact-detail__related section-pad">
          <div className="container">
            <Reveal className="artifact-detail__related-head">
              <h2 className="artifact-detail__related-title">Continue exploring</h2>
            </Reveal>
            <div className="artifact-detail__related-grid">
              {related.map((r, i) => (
                <ArtifactCard key={r.id} artifact={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- LIGHTBOX ---- */}
      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Artifact image viewer">
          <button
            type="button"
            className="lightbox__close"
            onClick={() => setLightbox(false)}
            aria-label="Close image viewer"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={() => setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length)}
            aria-label="Previous image"
          >
            ‹
          </button>
          <div className="lightbox__img">
            <img src={gallery[lightboxIndex]} alt={artifact.name} />
          </div>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={() => setLightboxIndex((i) => (i + 1) % gallery.length)}
            aria-label="Next image"
          >
            ›
          </button>
          <div className="lightbox__count">
            {String(lightboxIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
}