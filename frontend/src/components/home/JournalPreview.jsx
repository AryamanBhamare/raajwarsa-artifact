import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import { firstImage, formatDate, readingTime } from '../../lib/utils';

export default function JournalPreview({ articles, loading }) {
  return (
    <section className="journalPrev section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="The Heritage Journal"
          title="Stories worth preserving"
          subtitle="Notes from the archive — history, craftsmanship and the life behind objects."
        />

        {loading ? (
          <div className="journalPrev__grid">
            {[0, 1].map((i) => (
              <div key={i} className="journalPrev__card-skeleton skeleton" />
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="journalPrev__grid">
            {articles.slice(0, 3).map((article, i) => (
              <Reveal key={article.id} delay={i * 100} className="journalPrev__card">
                <Link to={`/journal/${article.slug}`} className="journalPrev__card-link">
                  <div className="journalPrev__media">
                    <img
                      src={firstImage(article)}
                      alt={article.title}
                      loading="lazy"
                      className="journalPrev__img"
                    />
                    <span className="journalPrev__category">{article.category}</span>
                  </div>
                  <div className="journalPrev__body">
                    <div className="journalPrev__meta">
                      <span>{formatDate(article.publishDate)}</span>
                      <span>·</span>
                      <span>{readingTime(article.content)}</span>
                    </div>
                    <h3 className="journalPrev__title">{article.title}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="journalPrev__empty">
            <p>No journal articles have been published yet.</p>
          </Reveal>
        )}

        <Reveal className="journalPrev__more" delay={120}>
          <Link to="/journal" className="btn btn--outline">
            Read the journal
            <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}