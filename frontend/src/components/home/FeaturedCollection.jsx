import { Link } from 'react-router-dom';
import ArtifactCard from '../ArtifactCard';
import SectionHeading from '../SectionHeading';
import Reveal from '../Reveal';

export default function FeaturedCollection({ artifacts, loading }) {
  return (
    <section className="featured section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="The Collection"
          title="Objects that carry stories"
          subtitle="A curated selection of heritage artifacts from the Raajwarasa archive."
        />

        {loading ? (
          <div className="featured__grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="featured__card-skeleton skeleton" />
            ))}
          </div>
        ) : artifacts && artifacts.length > 0 ? (
          <Reveal className="featured__grid">
            {artifacts.slice(0, 3).map((artifact, i) => (
              <ArtifactCard key={artifact.id} artifact={artifact} index={i} />
            ))}
          </Reveal>
        ) : (
          <Reveal className="featured__empty">
            <p>No artifacts have been added to the collection yet.</p>
          </Reveal>
        )}

        <Reveal className="featured__more" delay={120}>
          <Link to="/collection" className="btn btn--outline">
            View the full collection
            <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}