import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { firstImage } from '../lib/utils';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export default function SearchOverlay({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounced = useDebouncedValue(query, 320);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSearched(false);
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!debounced || debounced.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get(`/api/public/artifacts?search=${encodeURIComponent(debounced.trim())}&size=8`)
      .then((data) => {
        if (!cancelled) {
          setResults(data.items || []);
          setSearched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setSearched(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  if (!open) return null;

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Search the archive">
      <div className="search__backdrop" onClick={onClose} />
      <div className="search__panel">
        <div className="search__head">
          <span className="search__eyebrow">SEARCH THE ARCHIVE</span>
          <button type="button" className="search__close" onClick={onClose} aria-label="Close search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="search__input-wrap">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" className="search__icon">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="search__input"
            type="text"
            placeholder="Search artifacts, materials, periods…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search artifacts"
          />
        </div>

        <div className="search__body">
          {!query && (
            <div className="search__hint">
              <p>Search by artifact name, category, material, period or origin.</p>
            </div>
          )}

          {loading && (
            <div className="search__results">
              <div className="search__skeleton-rows">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="search__skeleton-row skeleton" />
                ))}
              </div>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="search__empty">
              <div className="search__empty-line" />
              <p className="search__empty-title">Nothing found in the archive.</p>
              <p className="search__empty-sub">Try a different name, material or period.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search__results" role="list" aria-label="Results">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  className="search__result"
                  onClick={() => onNavigate(`/collection/${item.slug}`)}
                >
                  <div className="search__result-img">
                    <img src={firstImage(item)} alt={item.name} loading="lazy" />
                  </div>
                  <div className="search__result-info">
                    <span className="search__result-category">{item.category?.name}</span>
                    <span className="search__result-name">{item.name}</span>
                    {item.period && <span className="search__result-meta">{item.period} · {item.material}</span>}
                  </div>
                  <span className="search__result-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="search__foot">
          <span>PRESS <kbd>ESC</kbd> TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}