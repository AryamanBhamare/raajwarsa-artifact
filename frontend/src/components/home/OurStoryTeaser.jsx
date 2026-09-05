import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

const TIMELINE = [
  {
    period: 'Origins',
    title: 'Where it began',
    text: 'The roots of the collection lie in the objects and memories carried through generations.',
    icon: '✦'
  },
  {
    period: 'The Collection',
    title: 'The gathering',
    text: 'Artifacts, objects and stories gathered quietly, each with its own history to tell.',
    icon: '◈'
  },
  {
    period: 'Preservation',
    title: 'Caring for the past',
    text: 'Learning how to preserve, document and present heritage with responsibility.',
    icon: '◆'
  },
  {
    period: 'Raajwarasa',
    title: 'A name, a purpose',
    text: 'A decision to share this heritage — to give it a voice for a modern audience.',
    icon: '❖'
  },
  {
    period: 'The Future',
    title: 'Forward',
    text: 'Growing the story, the collection and the community that values it.',
    icon: '✦'
  }
];

export default function OurStoryTeaser() {
  return (
    <section className="teaserStory section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="Our Story"
          title="A heritage carried forward"
          subtitle="The journey behind Raajwarasa — from family memory to a shared collection."
        />

        <div className="teaserStory__timeline">
          {TIMELINE.map((item, i) => (
            <Reveal key={item.period} delay={i * 90} className="teaserStory__node">
              <div className="teaserStory__node-head">
                <span className="teaserStory__node-icon" aria-hidden="true">{item.icon}</span>
                <span className="teaserStory__node-period">{item.period}</span>
              </div>
              <h3 className="teaserStory__node-title">{item.title}</h3>
              <p className="teaserStory__node-text">{item.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="teaserStory__more" delay={120}>
          <Link to="/our-story" className="btn btn--outline">
            Read the full story
            <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}