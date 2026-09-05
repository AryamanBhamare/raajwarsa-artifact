import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

const TIMELINE = [
  {
    period: 'Phase One',
    title: 'Origins',
    text: 'The roots of the collection lie in objects and memories carried carefully through generations of family life in Maharashtra.',
    note: 'A private chapter, told in full once the family shares its story.'
  },
  {
    period: 'Phase Two',
    title: 'The Collection',
    text: 'Artifacts, objects and material heritage gathered quietly over time — each with its own history, its own maker and its own reasons to be kept.',
    note: 'Gradually documented and catalogued.'
  },
  {
    period: 'Phase Three',
    title: 'Preservation',
    text: 'Learning the discipline of preservation — how to care for objects so their material and their stories endure for the next generation.',
    note: 'Care, documentation and responsible presentation.'
  },
  {
    period: 'Phase Four',
    title: 'Raajwarasa',
    text: 'A decision to give this heritage a name and a voice — to present it to a modern audience that values the past and wants to understand it.',
    note: 'This website is that decision, made tangible.'
  },
  {
    period: 'Phase Five',
    title: 'The Future',
    text: 'Growing the collection, the documentation and the community of people who value Maharashtra\'s heritage — and passing it forward.',
    note: 'A story still being written.'
  }
];

export default function OurStoryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__overlay page-hero__overlay--story" />
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--onhero">Our Story</span>
          <h1 className="page-hero__title">A heritage carried forward</h1>
          <p className="page-hero__sub">
            The journey of Raajwarasa — from family memory to a shared collection.
          </p>
        </div>
      </section>

      <section className="story-page section-pad">
        <div className="container">
          <div className="story-page__lede">
            <Reveal>
              <h2 className="story-page__lede-title">
                "History is not only something we read about. It is something we can preserve,
                experience and pass forward."
              </h2>
              <p className="story-page__lede-text">
                Raajwarasa began with objects and the memories they carried. Over time, a
                private collection became a way of understanding the past — and a decision to
                share it with others who value heritage as much as we do.
              </p>
            </Reveal>
          </div>

          <div className="story-page__timeline">
            {TIMELINE.map((phase, i) => (
              <Reveal key={phase.title} delay={i * 80} className="story-page__phase">
                <div className="story-page__phase-marker">
                  <span className="story-page__phase-dot" />
                  <span className="story-page__phase-line" aria-hidden="true" />
                </div>
                <div className="story-page__phase-body">
                  <span className="story-page__phase-period">{phase.period}</span>
                  <h3 className="story-page__phase-title">{phase.title}</h3>
                  <p className="story-page__phase-text">{phase.text}</p>
                  <p className="story-page__phase-note">{phase.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="story-page__cta">
            <p className="story-page__cta-text">
              If you have questions about the collection or the story behind a piece,
              we would be glad to talk.
            </p>
            <Link to="/contact" className="btn btn--primary btn--lg">
              Talk to us
              <span className="btn-arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}