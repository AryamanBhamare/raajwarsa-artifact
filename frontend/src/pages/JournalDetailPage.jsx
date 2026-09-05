import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJournalArticle } from '../lib/api';
import { firstImage, formatDate, readingTime } from '../lib/utils';

export default function JournalDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJournalArticle(slug)
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="journal-detail section-pad">
        <div className="container">
          <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 500, width: '100%', marginBottom: 32 }} />
          <div className="skeleton" style={{ height: 200, width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="journal-detail section-pad">
        <div className="container">
          <div className="journal-detail__missing">
            <span className="journal-detail__missing-mark">✦</span>
            <h1>The archive has no record of this article.</h1>
            <Link to="/journal" className="btn btn--outline">Return to the journal</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="journal-detail">
      <header className="journal-detail__header">
        <div className="container journal-detail__meta">
          <Link to="/journal" className="journal-detail__back">← Journal</Link>
          <div className="journal-detail__meta-line">
            <span className="journal-detail__category">{article.category}</span>
            <span>·</span>
            <span>{formatDate(article.publishDate)}</span>
            <span>·</span>
            <span>{readingTime(article.content)}</span>
            {article.author && <span>· {article.author}</span>}
          </div>
          <h1 className="journal-detail__title">{article.title}</h1>
        </div>
        <div className="journal-detail__cover">
          <img src={firstImage(article)} alt={article.title} />
        </div>
      </header>

      <div className="container">
        <div className="journal-detail__body">
          <div className="journal-detail__content">
            {article.content ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>Full article coming soon.</p>
            )}
          </div>

          <aside className="journal-detail__aside">
            <div className="journal-detail__aside-card">
              <h3 className="journal-detail__aside-title">About this piece</h3>
              <p className="journal-detail__aside-text">
                This article is part of the Raajwarasa Heritage Journal — stories told with care,
                and only where the facts can be documented.
              </p>
              <Link to="/collection" className="journal-detail__aside-link">Explore the collection →</Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}