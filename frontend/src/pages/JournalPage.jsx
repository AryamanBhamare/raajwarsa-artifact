import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJournal } from '../lib/api';
import Reveal from '../components/Reveal';
import { firstImage, formatDate, readingTime } from '../lib/utils';

export default function JournalPage() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJournal({ page: 0, size: 9 })
      .then((data) => {
        if (cancelled) return;
        setArticles(data.content || []);
        setTotal(data.totalElements || data.numberOfElements || 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__overlay page-hero__overlay--journal" />
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--onhero">The Heritage Journal</span>
          <h1 className="page-hero__title">Notes from the archive</h1>
          <p className="page-hero__sub">
            Stories of history, craftsmanship and the life behind objects.
          </p>
        </div>
      </section>

      <section className="journal-page section-pad">
        <div className="container">
          {loading && (
            <div className="journal-page__grid">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="journal-page__card-skeleton skeleton" />
              ))}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="journal-page__empty">
              <span className="journal-page__empty-mark">✦</span>
              <p>No journal articles have been published yet.</p>
            </div>
          )}

          {!loading && articles.length > 0 && (
            <>
              <div className="journal-page__grid">
                {articles.map((article, i) => (
                  <Reveal key={article.id} delay={(i % 3) * 90} className="journalEntry">
                    <Link to={`/journal/${article.slug}`} className="journalEntry__link">
                      <div className="journalEntry__media">
                        <img src={firstImage(article)} alt={article.title} loading="lazy" className="journalEntry__img" />
                        <span className="journalEntry__category">{article.category}</span>
                      </div>
                      <div className="journalEntry__body">
                        <div className="journalEntry__meta">
                          <span>{formatDate(article.publishDate)}</span>
                          <span>·</span>
                          <span>{readingTime(article.content)}</span>
                        </div>
                        <h2 className="journalEntry__title">{article.title}</h2>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>

              {page * 9 + articles.length < total && (
                <Reveal className="journal-page__more">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchJournal({ page: next, size: 9 }).then((data) => {
                        setArticles((prev) => [...prev, ...(data.content || [])]);
                        setTotal(data.totalElements || 0);
                      });
                    }}
                  >
                    Load more
                    <span className="btn-arrow">→</span>
                  </button>
                </Reveal>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}