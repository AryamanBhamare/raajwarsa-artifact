import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { firstImage } from '../lib/utils';

export default function AdminArtifacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (q = '') => {
    setLoading(true);
    adminApi
      .artifacts({ search: q || undefined, page: 0, size: 100 })
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this artifact? This cannot be undone.')) return;
    await adminApi.deleteArtifact(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="a-page">
      <div className="a-page__head a-page__head--between">
        <div>
          <h1 className="a-page__title">Artifacts</h1>
          <p className="a-page__sub">{items.length} in the archive</p>
        </div>
        <Link to="/admin/artifacts/new" className="a-btn a-btn--primary">
          + New Artifact
        </Link>
      </div>

      <div className="a-search">
        <input
          className="a-input a-input--inline"
          placeholder="Search artifacts…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            load(e.target.value);
          }}
        />
      </div>

      {loading && <div className="a-skeleton" style={{ height: 300 }} />}

      {!loading && items.length === 0 && (
        <div className="a-empty">No artifacts have been added to the collection yet.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="a-artifacts">
          {items.map((a) => (
            <div key={a.id} className="a-artifact">
              <div className="a-artifact__img">
                <img src={firstImage(a)} alt={a.name} loading="lazy" />
              </div>
              <div className="a-artifact__info">
                <div className="a-artifact__name">
                  {a.name}
                  {a.featured && <span className="a-tag a-tag--gold">Featured</span>}
                  {!a.active && <span className="a-tag a-tag--muted">Inactive</span>}
                </div>
                <div className="a-artifact__meta">
                  {a.category?.name} · {a.period || 'Period TBC'} · {a.availability}
                </div>
              </div>
              <div className="a-artifact__actions">
                <Link to={`/admin/artifacts/edit/${a.id}`} className="a-btn a-btn--sm a-btn--outline">
                  Edit
                </Link>
                <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => remove(a.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}