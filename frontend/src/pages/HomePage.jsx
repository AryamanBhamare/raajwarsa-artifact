import { useEffect, useState } from 'react';
import { fetchFeatured, fetchHome, fetchJournalLatest } from '../lib/api';
import Hero from '../components/home/Hero';
import Introduction from '../components/home/Introduction';
import FeaturedCollection from '../components/home/FeaturedCollection';
import HeritageSection from '../components/home/HeritageSection';
import FeaturedArtifact from '../components/home/FeaturedArtifact';
import OurStoryTeaser from '../components/home/OurStoryTeaser';
import JournalPreview from '../components/home/JournalPreview';
import InstagramSection from '../components/home/InstagramSection';
import EnquiryCTA from '../components/home/EnquiryCTA';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [heroArtifact, setHeroArtifact] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchHome(), fetchJournalLatest()])
      .then(([homeRes, journalRes]) => {
        if (cancelled) return;
        const home = homeRes.status === 'fulfilled' ? homeRes.value : {};
        const items = home.featured || [];
        setFeatured(items);
        setHeroArtifact(items[0] || null);
        if (journalRes.status === 'fulfilled') setArticles(journalRes.value || []);
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
      <Hero artifact={heroArtifact} />
      <Introduction />
      <FeaturedCollection artifacts={featured} loading={loading} />
      <HeritageSection />
      <FeaturedArtifact artifact={featured[1] || featured[0]} loading={loading} />
      <OurStoryTeaser />
      <JournalPreview articles={articles} loading={loading} />
      <InstagramSection />
      <EnquiryCTA />
    </>
  );
}