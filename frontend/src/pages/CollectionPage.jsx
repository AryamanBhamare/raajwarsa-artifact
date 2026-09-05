import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchArtifacts, fetchCategories, fetchFilterOptions } from '../lib/api';
import ArtifactCard from '../components/ArtifactCard';
import Reveal from '../components/Reveal';

function SectionHeader() {
  return (
    <section className="page-hero page-hero--short">
      <div className="page-hero__overlay" />
      <div className="container page-hero__content">
        <span className="eyebrow eyebrow--onhero">The Archive</span>
        <h1 className="page-hero__title">Explore the Collection</h1>
        <p className="page-hero__sub">
          Objects, craftsmanship and stories preserved and presented with care.
        </p>
      </div>
    </section>
  );
}

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artifacts, setArtifacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filterData, setFilterData] = useState({ periods: [], materials: [], regions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [view, setView] = useState('grid');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const period = searchParams.get('period') || '';
  const material = searchParams.get('material') || '';
  const region = searchParams.get('region') || '';
  const availability = searchParams.get('availability') || '';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    Promise.allSettled([fetchCategories(), fetchFilterOptions()]).then(([c, f]) => {
      if (c.status === 'fulfilled') setCategories(c.value);
      if (f.status === 'fulfilled') setFilterData(f.value);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setPage(0);
    const params = {
      search: query || undefined,
      category: category || undefined,
      period: period || undefined,
      material: material || undefined,
      region: region || undefined,
      availability: availability || undefined,
      featured: featured === '1' ? 'true' : undefined,
      page: 0,
      size: 12
    };
    fetchArtifacts(params)
      .then((data) => {
        if (cancelled) return;
        setArtifacts(data.items || []);
        setTotal(data.totalElements || 0);
      })
      .catch(() => {
        if (!cancelled) setError('Something went wrong while opening the archive.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, category, period, material, region, availability, featured]);

  useEffect(() => {
    const params = { q: query, category, period, material, region, availability, featured };
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
    setSearchParams(clean, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const hasActiveFilters = Boolean(
    category || period || material || region || availability || featured
  );

  const rendered = useMemo(() => artifacts, [artifacts]);

  return (
    <>
      <SectionHeader />

      <section className="collection">
        <div className="container">
          <div className="collection__toolbar">
            <div className="collection__search">
              <span className="collection__search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="text"
                className="collection__search-input"
                placeholder="Search the archive…"
                value={query}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set('q', e.target.value);
                  else next.delete('q');
                  setSearchParams(next);
                }}
                aria-label="Search artifacts"
              />
            </div>

            <div className="collection__view">
              <button
                type="button"
                className={`collection__view-btn ${view === 'grid' ? 'collection__view-btn--active' : ''}`}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" />
                  <rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" />
                </svg>
              </button>
              <button
                type="button"
                className={`collection__view-btn ${view === 'list' ? 'collection__view-btn--active' : ''}`}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="4" rx="1" />
                  <rect x="3" y="10" width="11" height="4" rx="1" />
                  <rect x="3" y="16" width="18" height="4" rx="1" />
                </svg>
              </button>
            </div>
          </div>

          <div className="collection__body">
            <aside className="collection__filters">
              <div className="collection__filters-head">
                <span className="collection__filters-title">Filters</span>
                {hasActiveFilters && (
                  <button type="button" className="collection__filters-clear" onClick={clearFilters}>
                    Clear all
                  </button>
                )}
              </div>

              <div className="filter-group">
                <span className="filter-group__title">Category</span>
                <div className="filter-group__options">
                  {categories.length === 0 && <span className="filter-empty">Details coming soon.</span>}
                  {categories.map((c) => (
                    <label key={c.id} className="filter-chip">
                      <input
                        type="radio"
                        name="category"
                        checked={category === c.slug}
                        onChange={() => updateFilter('category', category === c.slug ? '' : c.slug)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group__title">Period</span>
                <div className="filter-group__options">
                  {filterData.periods.length === 0 && <span className="filter-empty">Details coming soon.</span>}
                  {filterData.periods.map((p) => (
                    <label key={p} className="filter-chip">
                      <input
                        type="radio"
                        name="period"
                        checked={period === p}
                        onChange={() => updateFilter('period', period === p ? '' : p)}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group__title">Material</span>
                <div className="filter-group__options">
                  {filterData.materials.length === 0 && <span className="filter-empty">Details coming soon.</span>}
                  {filterData.materials.map((m) => (
                    <label key={m} className="filter-chip">
                      <input
                        type="radio"
                        name="material"
                        checked={material === m}
                        onChange={() => updateFilter('material', material === m ? '' : m)}
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group__title">Availability</span>
                <div className="filter-group__options">
                  {['AVAILABLE', 'ON_REQUEST'].map((a) => (
                    <label key={a} className="filter-chip">
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === a}
                        onChange={() => updateFilter('availability', availability === a ? '' : a)}
                      />
                      <span>{a === 'AVAILABLE' ? 'Available' : 'On request'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="collection__results">
              <div className="collection__count">
                {loading ? 'Searching the archive…' : `${total} artifact${total === 1 ? '' : 's'}`}
              </div>

              {error && <div className="collection__error">{error}</div>}

              {loading && (
                <div className={`collection__grid collection__grid--${view}`}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="collection__card-skeleton skeleton" />
                  ))}
                </div>
              )}

              {!loading && !error && rendered.length === 0 && (
                <div className="collection__empty">
                  <span className="collection__empty-mark">✦</span>
                  <p className="collection__empty-title">Nothing found in the archive.</p>
                  <p className="collection__empty-sub">Try different keywords or clear the filters.</p>
                  <button type="button" className="btn btn--outline btn--sm" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              )}

              {!loading && !error && rendered.length > 0 && (
                <div className={`collection__grid collection__grid--${view}`}>
                  {rendered.map((artifact, i) => (
                    <ArtifactCard key={artifact.id} artifact={artifact} index={i} />
                  ))}
                </div>
              )}

              {!loading && !error && total > rendered.length && (
                <Reveal className="collection__loadmore">
                  <button
                    type="button"
                    className="btn btn--outline"
                    disabled={loading}
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchArtifacts({
                        search: query || undefined,
                        category: category || undefined,
                        period: period || undefined,
                        material: material || undefined,
                        region: region || undefined,
                        availability: availability || undefined,
                        featured: featured === '1' ? 'true' : undefined,
                        page: next,
                        size: 12
                      }).then((data) => {
                        setArtifacts((prev) => [...prev, ...(data.items || [])]);
                        setTotal(data.totalElements || 0);
                      });
                    }}
                  >
                    Load more
                    <span className="btn-arrow">→</span>
                  </button>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}