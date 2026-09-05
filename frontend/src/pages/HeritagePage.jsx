import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

function PageHeader({ eyebrow, title, sub }) {
  return (
    <section className="page-hero">
      <div className="page-hero__overlay page-hero__overlay--heritage" />
      <div className="container page-hero__content">
        <span className="eyebrow eyebrow--onhero">{eyebrow}</span>
        <h1 className="page-hero__title">{title}</h1>
        {sub && <p className="page-hero__sub">{sub}</p>}
      </div>
    </section>
  );
}

const REGIONS = [
  {
    title: 'The Sahyadris',
    text: 'The mountain ranges that gave shape to Maharashtra\'s landscape and fortified its history across the Western Ghats.',
    img: '/placeholders/fort-arch.svg'
  },
  {
    title: 'Fort Architectures',
    text: 'From the sea-bound ramparts of coastal forts to hill citadels, stone architecture tells the region\'s layered past.',
    img: '/placeholders/stone-carv.svg'
  },
  {
    title: 'Traditions & Craft',
    text: 'Metalwork, textiles and craftsmanship passed from hand to hand through generations of artisans.',
    img: '/placeholders/bronze-vessel.svg'
  },
  {
    title: 'The Maratha Era',
    text: 'A period that profoundly shaped the political and cultural identity of the region and its people.',
    img: '/placeholders/maratha-sword.svg'
  }
];

const PRINCIPLES = [
  {
    title: 'Authenticity',
    desc: 'We present what can be documented and verified. We do not fabricate provenance or history.'
  },
  {
    title: 'Preservation',
    desc: 'Caring for objects so their stories, and the craftsmanship within them, endure.'
  },
  {
    title: 'Sharing',
    desc: 'Heritage is only meaningful when it is experienced, understood and passed forward.'
  }
];

export default function HeritagePage() {
  return (
    <>
      <PageHeader
        eyebrow="The Land of Heritage"
        title="Heritage of Maharashtra"
        sub="The landscape, craftsmanship and traditions that shaped a remarkable cultural legacy."
      />

      <section className="heritage-page section-pad">
        <div className="container">
          <div className="heritage-page__intro">
            <Reveal>
              <span className="eyebrow eyebrow--left">A note</span>
              <h2 className="heritage-page__intro-title">History is not only something we read about.</h2>
              <p className="heritage-page__intro-text">
                It is something we can preserve, experience and pass forward. Raajwarasa is an
                attempt to do exactly that — quietly, respectfully, and with care for the truth
                of these objects.
              </p>
            </Reveal>
          </div>

          <div className="heritage-page__regions">
            {REGIONS.map((region, i) => (
              <Reveal key={region.title} delay={i * 100} className="heritage-page__region">
                <div className="heritage-page__region-img">
                  <img src={region.img} alt={region.title} loading="lazy" />
                </div>
                <div className="heritage-page__region-body">
                  <span className="heritage-page__region-num">0{i + 1}</span>
                  <h3 className="heritage-page__region-title">{region.title}</h3>
                  <p className="heritage-page__region-text">{region.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="heritage-page__principles">
            <div className="heritage-page__principles-head">
              <span className="eyebrow eyebrow--center">Our approach</span>
              <h2 className="heritage-page__principles-title">The values behind the collection</h2>
            </div>
            <div className="heritage-page__principles-grid">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.title} delay={i * 100} className="heritage-page__principle">
                  <span className="heritage-page__principle-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" strokeLinecap="round" />
                    </svg>
                  </span>
                  <h3 className="heritage-page__principle-title">{p.title}</h3>
                  <p className="heritage-page__principle-text">{p.desc}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal className="heritage-page__cta">
            <Link to="/collection" className="btn btn--primary btn--lg">
              Explore the collection
              <span className="btn-arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}